import {
  buildReport,
  writePipelineReport,
  type ConsolidatedPipelineReport,
} from "./reporters/report-generator.js";
import { sendReportToApi } from "./reporters/report-uploader.js";
import { printTerminalReport } from "./reporters/terminal-reporter.js";
import chalk from "chalk";
import { runAudit } from "./auditors/audit-runner.js";
import { loadAuditConfig } from "./navigation-engine.js";
import type { AuditSiteConfig } from "./auditors/audit-config.js";
import { API_RELATORIOS_ENDPOINT } from "./config/api.js";

async function main() {
  const { url, configPath, noW3c, jsonOutput, pipelineJson } = parseArgs();

  if (configPath) {
    await runMultiUrlAudit(configPath, pipelineJson);
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
  console.log(`Iniciando auditoria (modo URL unica) para: ${url}`);

  const config = buildSingleUrlConfig(url, !noW3c);
  const { records, assistiveAggregated, plan, durationMs } =
    await runAudit(config);
  const report = buildReport(
    records,
    plan.flows.length,
    assistiveAggregated,
    durationMs,
  );
  await writePipelineReport(report, jsonOutput);
  printTerminalReport(report);

  console.log(`\nArquivo gerado: ${jsonOutput} `);
}

async function runMultiUrlAudit(configPath: string, pipelineJson: string) {
  console.log(`Iniciando auditoria multi-pagina (config: ${configPath})`);
  const config = await loadAuditConfig(configPath);
  const { records, assistiveAggregated, plan, durationMs } =
    await runAudit(config);
  const flowsCount = plan.flows.length;
  const report = buildReport(
    records,
    flowsCount,
    assistiveAggregated,
    durationMs,
  );
  await writePipelineReport(report, pipelineJson);

  console.log(chalk.bold("\n=== Resumo (pipeline) ==="));
  console.log(`Rotas auditadas: ${report.summary.routesAudited}`);
  console.log(`Fluxos autenticados: ${report.summary.flowsAudited}`);
  console.log(
    `VLibras: ${report.summary.assistiveTechnologies.vlibras ? "sim" : "nao"}`,
  );
  console.log(
    `Hand Talk: ${report.summary.assistiveTechnologies.handTalk ? "sim" : "nao"}`,
  );
  report.results.forEach((r) => {
    console.log(
      `- ${r.path ?? r.url}${r.flowName ? ` [${r.flowName}]` : ""} | score: ${r.score ?? "N/A"} | criticos: ${r.criticalIssues}`,
    );
  });
  console.log(`\nArquivo gerado: ${pipelineJson} `);

  await trySendingReportToApi(config, report);
}

async function trySendingReportToApi(
  config: AuditSiteConfig,
  report: ConsolidatedPipelineReport,
): Promise<void> {
  if (config.projectId == null || config.projectId === "") {
    console.log("\nEnvio para API ignorado (projectId não configurado).");
    return;
  }

  console.log(`\nEnviando relatório para ${API_RELATORIOS_ENDPOINT} ...`);
  await sendReportToApi({
    projectId: config.projectId,
    report,
  });
  console.log("Relatório enviado com sucesso.");
}

function buildSingleUrlConfig(
  url: string,
  includeW3c: boolean,
): AuditSiteConfig {
  const parsed = new URL(url);
  const path = `${parsed.pathname}${parsed.search}` || "/";

  return {
    baseUrl: parsed.origin,
    routes: [path],
    authenticatedFlows: [],
    includeW3c,
  };
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
