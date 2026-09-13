#!/usr/bin/env node
import { resolve } from "node:path";
import {
  buildReport,
  writePipelineReport,
  type ConsolidatedPipelineReport,
} from "./reporters/report-generator.js";
import { sendReportToApi } from "./reporters/report-api.js";
import chalk from "chalk";
import { runAudit } from "./auditors/audit-runner.js";
import { loadAuditConfig } from "./navigation-engine.js";
import { ensurePlaywrightChromium } from "./helpers/ensure-playwright-chromium.js";
import type { AuditSiteConfig } from "./auditors/audit-config.js";
import { API_RELATORIOS_ENDPOINT } from "./config.js";

const DEFAULT_CONFIG = "argos.config.json";
const DEFAULT_OUT = "reports/report.json";
const USAGE =
  "Uso: npx argos-avaliador-acessibilidade [--config argos.config.json] [--out reports/report.json]";

async function main() {
  const { configPath, outputPath } = parseArgs();
  await ensurePlaywrightChromium();
  await runAuditFromConfig(configPath, outputPath);
}

main().catch((error: unknown) => {
  console.error("Falha na auditoria:", error);
  process.exit(1);
});

async function runAuditFromConfig(
  configPath: string,
  outputPath: string | undefined,
) {
  console.log(`Iniciando auditoria (config: ${configPath})`);
  const config = await loadAuditConfig(configPath);
  const { records, assistiveAggregated, plan, durationMs } =
    await runAudit(config);
  const report = buildReport(
    records,
    plan.flows.length,
    assistiveAggregated,
    durationMs,
  );
  if (outputPath) {
    await writePipelineReport(report, outputPath);
  }

  console.log(chalk.bold("\n=== Resumo (pipeline) ==="));
  console.log(`Rotas auditadas: ${report.summary.routesAudited}`);
  console.log(`Fluxos autenticados: ${report.summary.flowsAudited}`);
  console.log(`Pontuação total: ${report.summary.score}`);

  if (report.summary.assistiveTechnologies.vlibras) {
    console.log("VLibras detectado");
  } else if (report.summary.assistiveTechnologies.handTalk) {
    console.log("Hand Talk detectado");
  } else {
    console.log("Nenhuma tecnologia assistiva para Libras detectada");
  }

  console.log("\n=== Rotas auditadas ===");
  report.results.forEach((r) => {
    console.log(
      `- ${r.path ?? r.url}${r.flowName ? ` [${r.flowName}]` : ""} | pontuação: ${r.score ?? "N/A"} | criticos: ${r.criticalIssues}`,
    );
  });
  if (outputPath) {
    console.log(`\nArquivo gerado: ${outputPath} `);
  }

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

function parseArgs(): { configPath: string; outputPath: string } {
  const args = process.argv.slice(2);
  let configPath = DEFAULT_CONFIG;
  let outputPath = DEFAULT_OUT;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--config") {
      configPath = requireFlagValue(args, ++i, "--config");
      continue;
    }

    if (arg === "--out") {
      outputPath = requireFlagValue(args, ++i, "--out");
      continue;
    }

    console.error(`Argumento inválido: ${arg}\n${USAGE}`);
    process.exit(1);
  }

  return {
    configPath: resolve(process.cwd(), configPath),
    outputPath: resolve(process.cwd(), outputPath),
  };
}

function requireFlagValue(args: string[], index: number, flag: string): string {
  const value = args[index];
  if (!value || value.startsWith("-")) {
    throw new Error(`${flag} exige um valor.\n${USAGE}`);
  }
  return value;
}
