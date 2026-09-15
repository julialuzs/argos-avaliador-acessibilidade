import { Severity, SeverityTypes } from "../auditors/types.js";

export function normalizeSeverity(input?: string): Severity {
  const value = (input || "").toLowerCase();

  if (value.includes("critical")) return SeverityTypes.Critical;
  if (value.includes("serious") || value.includes("high")) return SeverityTypes.Serious;
  if (value.includes("moderate") || value.includes("medium")) return SeverityTypes.Moderate;
  if (value.includes("minor") || value.includes("low")) return SeverityTypes.Minor;

  return SeverityTypes.Informative;
}

/**
 * O validador W3C só distingue error vs warning/info — isso é conformidade com a spec,
 * não impacto de acessibilidade no sentido do axe-core (critical/serious/…).
 *
 * HTML inválido ainda pode atrapalhar AT (nome, hierarquia, aninhamento) → Moderado.
 * CSS inválido quase nunca é barreira de uso → Baixo.
 * Avisos permanecem abaixo disso e não competem com violações do axe.
 */
export function severityFromW3c(
  kind: "error" | "warning",
  source: "html" | "css",
): Severity {
  if (kind !== "error") {
    return SeverityTypes.Minor;
  }

  return source === "html" ? SeverityTypes.Moderate : SeverityTypes.Minor;
}
