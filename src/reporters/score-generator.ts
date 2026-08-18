import { SeverityTypes, type Finding, type Severity } from "../auditors/types.js";

const SEVERITY_WEIGHTS: Record<Severity, number> = {
  1: 1.25,
  2: 1.0,
  3: 0.75,
  4: 0.5,
  5: 0.25,
};

const ASSISTIVE_TECH_BONUS = 1;

export function generateScore(
  bySeverity: Record<Severity, number>,
  assistiveTechnologiesDetected: boolean,
): number {
  const calculatePenalty = (severity: Severity) =>
    bySeverity[severity] * SEVERITY_WEIGHTS[severity];

  const penalty =
    calculatePenalty(SeverityTypes.Critical) +
    calculatePenalty(SeverityTypes.Serious) +
    calculatePenalty(SeverityTypes.Moderate) +
    calculatePenalty(SeverityTypes.Minor) +
    calculatePenalty(SeverityTypes.Informative);

  const base = Math.max(0, 100 - penalty);
  const bonus = assistiveTechnologiesDetected ? ASSISTIVE_TECH_BONUS : 0;

  return Math.min(100, Math.round(base + bonus));
}

export function countBySeverity(findings: Finding[]): Record<Severity, number> {
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
