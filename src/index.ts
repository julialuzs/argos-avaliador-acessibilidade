import { runAxeAudit } from "./auditors/axe/axe-auditor.js";
import { runW3CAudit } from "./auditors/w3c/w3c-auditor.js";
import {
  buildPipelineReport,
  writePipelineReport,
} from "./reporters/report-generator.js";
import { detectAssistiveTechOnPage } from "./auditors/assistive-tech-detector.js";
import { chromium } from "playwright";
import { writeJsonReport } from "./reporters/json-reporter.js";
import { printTerminalReport } from "./reporters/terminal-reporter.js";
import chalk from "chalk";
import { runConfigAudit } from "./auditors/audit-runner.js";
import { loadAuditConfig } from "./navigation-engine.js";
import { mapResults } from "./mapper.js";

async function main() {
  const { url, configPath, noW3c, jsonOutput, pipelineJson } = parseArgs();

  if (configPath) {
    await runPipelineFromConfig(configPath, pipelineJson);
    return;
  }

  if (!url) {
    console.error(
      "Uso:\n  npm run audit -- <url> [--no-w3c] [--json reports/...]\n  npm run audit -- --config audit.config.json [--out reports/report.json]",
    );
    process.exit(1);
  }

  if (url.startsWith("--")) {
    console.error(
      "Argumento invalido. Informe uma URL ou --config <arquivo.json>.",
    );
    process.exit(1);
  }

  await runSingleUrlAudit(url, noW3c, jsonOutput);
}

main().catch((error: unknown) => {
  console.error("Falha na auditoria:", error);
  process.exit(1);
});

async function runSingleUrlAudit(
  url: string,
  noW3c: boolean,
  jsonOutput: string,
) {
  assertValidUrl(url);
  const startedAt = Date.now();

  console.log(`Iniciando auditoria (modo URL unica) para: ${url}`);

  const [axe, assistiveTech, w3c] = await Promise.all([
    runAxeAudit(url),
    (async () => {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      try {
        await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 60_000,
        });
        return await detectAssistiveTechOnPage(page);
      } finally {
        await page.close();
        await browser.close();
      }
    })(),
    noW3c ? Promise.resolve(undefined) : runW3CAudit(url),
  ]);

  const mapped = mapResults({
    url,
    startedAt,
    axe,
    assistiveTech,
    w3c:
      w3c ??
      ({
        url,
        checked: false,
        apiAvailable: false,
        findings: [],
        rawSummary: { errors: 0, warnings: 0 },
      } as const),
  });

  await writeJsonReport(mapped, jsonOutput);
  printTerminalReport(mapped);

  console.log(`\nArquivos gerados: ${jsonOutput} `);
}

async function runPipelineFromConfig(configPath: string, pipelineJson: string) {
  console.log(`Iniciando auditoria multi-pagina (config: ${configPath})`);
  const config = await loadAuditConfig(configPath);
  const { records, assistiveAggregated, plan } = await runConfigAudit(config);
  const flowsCount = plan.flows.length;
  const report = buildPipelineReport(records, flowsCount, assistiveAggregated);
  await writePipelineReport(report, pipelineJson);

  console.log(chalk.bold("\n=== Resumo (pipeline) ==="));
  console.log(`Rotas auditadas: ${report.routesAudited}`);
  console.log(`Fluxos autenticados: ${report.flowsAudited}`);
  console.log(
    `VLibras: ${report.assistiveTechnologies.vlibras ? "sim" : "nao"}`,
  );
  console.log(
    `Hand Talk: ${report.assistiveTechnologies.handTalk ? "sim" : "nao"}`,
  );
  report.results.forEach((r) => {
    console.log(
      `- ${r.path}${r.flow ? ` [${r.flow}]` : ""} | score: ${r.score ?? "N/A"} | criticos: ${r.criticalIssues}`,
    );
  });
  console.log(`\nArquivos gerados: ${pipelineJson} `);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const configIdx = args.indexOf("--config");
  const configPath =
    configIdx !== -1
      ? (() => {
          const p = args[configIdx + 1];
          if (!p || p.startsWith("-")) {
            throw new Error("Uso: --config <arquivo.json>");
          }
          return p;
        })()
      : undefined;
  const positional = args.filter((a, i) => {
    if (a.startsWith("--")) {
      if (["--json", "--out", "--config"].includes(a)) return false;
      return false;
    }
    const prev = args[i - 1];
    if (prev && ["--json", "--out", "--config"].includes(prev)) return false;
    return true;
  });
  const url = configPath ? undefined : positional[0];
  const noW3c = args.includes("--no-w3c");
  const jsonOutput = getArgValue(args, "--json") ?? "reports/report.json";
  const pipelineJson = getArgValue(args, "--out") ?? "reports/report.json";

  return {
    url,
    configPath,
    noW3c,
    jsonOutput,
    pipelineJson,
  };
}

function getArgValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
}

function assertValidUrl(url: string): void {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Somente protocolos HTTP/HTTPS sao aceitos.");
    }
  } catch {
    throw new Error(`URL invalida: ${url}`);
  }
}
