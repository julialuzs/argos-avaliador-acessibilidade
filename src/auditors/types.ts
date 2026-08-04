import { W3CAuditResult } from "./w3c/types.js";

export type Severity = 1 | 2 | 3 | 4 | 5; // Crítico - 1, Alto - 2, Médio - 3, Baixo - 4, Informação - 5

export interface Finding {
  id: string;
  source: "axe" | "w3c" | "w3c-css";
  title: string;
  description: string;
//   impact?: string;
  severity: Severity;
  recommendation: string;
  emagCriteria: string[];
  helpUrl?: string;
  wcagRefs?: string[];
  htmlElement?: string;
  cssSelector?: string;
  elementCount?: number;
}

export interface AxeAuditResult {
  url: string;
  findings: Finding[];
  rawSummary: {
    violations: number;
    incomplete: number;
    passes: number;
  };
}

export interface AssistiveTechDetection {
  vlibras: {
    detected: boolean;
    evidence: string[];
  };
  handTalk: {
    detected: boolean;
    evidence: string[];
  };
}

export interface MappedReport {
  metadata: {
    url: string;
    timestamp: string;
    durationMs: number;
    toolVersions: Record<string, string>;
  };
  summary: {
    totalFindings: number;
    bySeverity: Record<Severity, number>;
    assistiveTech: AssistiveTechDetection;
  };
  findings: Finding[];
  raw: {
    axe: AxeAuditResult["rawSummary"];
    w3c: W3CAuditResult["rawSummary"] & {
      checked: boolean;
      apiAvailable: boolean;
    };
  };
}
