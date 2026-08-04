export type Severity = 1 | 2 | 3 | 4 | 5; // Crítico - 1, Alto - 2, Médio - 3, Baixo - 4, Informação - 5

export interface Finding {
  id: string;
  source: "axe" | "w3c" | "w3c-css";
  title: string;
  description: string;
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
