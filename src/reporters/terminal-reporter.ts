import chalk from "chalk";
import { MappedReport } from "../auditors/types.js";

export function printTerminalReport(report: MappedReport): void {
  const { summary, metadata } = report;

  console.log(chalk.bold("\n=== Relatorio de Auditoria de Acessibilidade ==="));
  console.log(`URL: ${metadata.url}`);
  console.log(`Data: ${metadata.timestamp}`);
  console.log(`Duracao: ${metadata.durationMs} ms`);
  console.log(`Total de achados: ${summary.totalFindings}\n`);

  console.log(chalk.bold("Severidades:"));
  console.log(`- Critica: ${summary.bySeverity[1]}`);
  console.log(`- Alta: ${summary.bySeverity[2]}`);
  console.log(`- Media: ${summary.bySeverity[3]}`);
  console.log(`- Baixa: ${summary.bySeverity[4]}`);
  console.log(`- Informativa: ${summary.bySeverity[5]}\n`);

  console.log(chalk.bold("Tecnologias assistivas BR:"));
  console.log(
    `- VLibras: ${summary.assistiveTech.vlibras.detected ? "Detectado" : "Nao detectado"}`,
  );
  if (summary.assistiveTech.vlibras.evidence.length) {
    console.log(
      `  Evidencias: ${summary.assistiveTech.vlibras.evidence.join(" | ")}`,
    );
  }
  console.log(
    `- Hand Talk: ${summary.assistiveTech.handTalk.detected ? "Detectado" : "Nao detectado"}`,
  );
  if (summary.assistiveTech.handTalk.evidence.length) {
    console.log(
      `  Evidencias: ${summary.assistiveTech.handTalk.evidence.join(" | ")}`,
    );
  }

  console.log(chalk.bold("\nTop achados:"));
  report.findings.slice(0, 10).forEach((finding, index) => {
    console.log(
      `${index + 1}. [${finding.source}] (${finding.severity}) ${finding.title}`,
    );
    console.log(`   Descricao: ${finding.description}`);
    console.log(`   Recomendacao: ${finding.recommendation}`);
    console.log(`   eMAG: ${finding.emagCriteria.join(", ")}`);
  });
}
