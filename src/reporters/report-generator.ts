import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { AssistiveTechDetection, Severity } from "../auditors/types.js";
import { RouteAuditRecord } from "../auditors/audit-runner.js";
import { countBySeverity, generateTotalScore } from "./score-generator.js";

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
  const assistiveTechnologies = {
    vlibras: assistiveAggregated.vlibras.detected,
    handTalk: assistiveAggregated.handTalk.detected,
  };

  return {
    summary: {
      score: generateTotalScore(records),
      totalFindings: allFindings.length,
      bySeverity,
      routesAudited: records.length,
      flowsAudited,
      assistiveTechnologies,
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
