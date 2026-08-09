import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { AssistiveTechDetection, Severity } from "../auditors/types.js";
import { RouteAuditRecord } from "../auditors/audit-runner.js";

export interface ConsolidatedPipelineReport {
  summary: {
    score: number;
    totalFindings: number;
    bySeverity: Record<Severity, number>;
    routesAudited: number;
    flowsAudited: number;
    assistiveTechnologies: {
      vlibras: boolean;
      handTalk: boolean;
    };
  };
  auditDate: string;
  durationMs: number;
  toolVersions: Record<string, string>;
  results: RouteAuditRecord[];
}

export function buildReport(
  records: RouteAuditRecord[],
  flowsAudited: number,
  assistiveAggregated: AssistiveTechDetection,
  durationMs: number,
): ConsolidatedPipelineReport {
  const allFindings = records.flatMap((r) => r.findings);
  const bySeverity = countBySeverity(allFindings);

  return {
    summary: {
      score: 0, //TODO: adicionar algoritmo de score
      totalFindings: allFindings.length,
      bySeverity,
      routesAudited: records.length,
      flowsAudited,
      assistiveTechnologies: {
        vlibras: assistiveAggregated.vlibras.detected,
        handTalk: assistiveAggregated.handTalk.detected,
      },
    },
    auditDate: new Date().toISOString(),
    durationMs,
    toolVersions: {
      axeCore: "4.x",
      playwright: "1.x",
    },
    results: records,
  };
}

export async function writePipelineReport(
  report: ConsolidatedPipelineReport,
  outputPath = "reports/report.json",
): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(report, null, 2), "utf-8");
}

function countBySeverity(
  findings: RouteAuditRecord["findings"],
): Record<Severity, number> {
  const initial: Record<Severity, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  for (const finding of findings) {
    initial[finding.severity] += 1;
  }

  return initial;
}
