import { Severity, SeverityTypes } from "../auditors/types.js";

export function normalizeSeverity(input?: string): Severity {
  const value = (input || "").toLowerCase();

  if (value.includes("critical")) return SeverityTypes.Critical;
  if (value.includes("serious") || value.includes("high")) return SeverityTypes.Serious;
  if (value.includes("moderate") || value.includes("medium")) return SeverityTypes.Moderate;
  if (value.includes("minor") || value.includes("low")) return SeverityTypes.Minor;

  return SeverityTypes.Informative;
}
