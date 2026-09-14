import chalk from "chalk";
import type { ConsolidatedPipelineReport } from "./report-generator.js";
import type { RouteAuditRecord } from "../auditors/audit-runner.js";

export function printTerminalReport(report: ConsolidatedPipelineReport): void {
  console.log(chalk.bold("\n=== Relatorio de Auditoria de Acessibilidade ==="));
  console.log(`Data: ${report.auditDate}`);
  console.log(`Duracao: ${report.durationMs} ms`);
  console.log(`Rotas auditadas: ${report.summary.routesAudited}`);
  console.log(`Total de achados: ${report.summary.totalFindings}\n`);

  console.log(chalk.bold("Severidades:"));
  console.log(`- Critica: ${report.summary.bySeverity[1]}`);
  console.log(`- Alta: ${report.summary.bySeverity[2]}`);
  console.log(`- Media: ${report.summary.bySeverity[3]}`);
  console.log(`- Baixa: ${report.summary.bySeverity[4]}`);
  console.log(`- Informativa: ${report.summary.bySeverity[5]}`);

  for (const record of report.results) {
    printRouteReport(record);
  }
}

function printRouteReport(report: RouteAuditRecord): void {
  const { assistiveTechnologies } = report;

  console.log(chalk.bold(`\n--- ${report.url} ---`));
  console.log(`Achados nesta rota: ${report.findings.length}`);
  console.log(`Criticos: ${report.criticalIssues}\n`);

  console.log(chalk.bold("Tecnologias assistivas BR:"));
  console.log(
    `- VLibras: ${assistiveTechnologies.vlibras.detected ? "Detectado" : "Nao detectado"}`,
  );
  if (assistiveTechnologies.vlibras.evidence.length) {
    console.log(
      `  Evidencias: ${assistiveTechnologies.vlibras.evidence.join(" | ")}`,
    );
  }
  console.log(
    `- Hand Talk: ${assistiveTechnologies.handTalk.detected ? "Detectado" : "Nao detectado"}`,
  );
  if (assistiveTechnologies.handTalk.evidence.length) {
    console.log(
      `  Evidencias: ${assistiveTechnologies.handTalk.evidence.join(" | ")}`,
    );
  }

  console.log(chalk.bold("\nTop achados:"));
  report.findings.slice(0, 10).forEach((finding, index) => {
    console.log(
      `${index + 1}. [${finding.source}] (${mapSeverityToLabel(finding.severity)}) ${finding.title}`,
    );
    console.log(`   Descricao: ${finding.description}`);
    console.log(`   Recomendacao: ${finding.recommendation}`);
    console.log(
      `   WCAG: ${finding.wcagRefs.length ? finding.wcagRefs.join(", ") : "—"}`,
    );
  });
}

function mapSeverityToLabel(severity: number): string {
  switch (severity) {
    case 1:
      return "Critica";
    case 2:
      return "Alta";
    case 3:
      return "Moderada";
    case 4:
      return "Baixa";
    case 5:
      return "Informativa";
    default:
      return "Desconhecido";
  }
}
