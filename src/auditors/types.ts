export type Severity = 1 | 2 | 3 | 4 | 5;

export const SeverityTypes: { [key: string]: Severity } = {
  Critical: 1,
  Serious: 2,
  Moderate: 3,
  Minor: 4,
  Informative: 5,
};

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
