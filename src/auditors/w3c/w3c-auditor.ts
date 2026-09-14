import { mapW3cCssToWcag, mapW3cHtmlToWcag } from "../../mappers/wcag-mapper.js";
import { normalizeSeverity } from "../../mappers/severity-mapper.js";
import {
  recommendationFromContext,
  translateToPortuguese,
} from "../../helpers/translator.js";
import { CssValidationIssue, W3CAuditResult } from "./types.js";
import { Finding } from "../types.js";
import { MAX_CSS_FINDINGS, W3C_NETWORK_NOISE } from "./config.js";
import { getCss, getHtml } from "./w3c.service.js";

export async function runW3CAudit(url: string): Promise<W3CAuditResult> {
  const [html, css] = await Promise.all([
    runW3CHtmlAudit(url),
    runW3CCssAudit(url),
  ]);
  return mergeW3cResults(html, css, url);
}

export async function runW3CHtmlAudit(url: string): Promise<W3CAuditResult> {
  const data = await getHtml(url);

  if (data === null) {
    return unavailableResult(url);
  }

  const messages = (data.messages ?? []).filter(
    (msg) => !isW3cNetworkNoise(msg.message),
  );
  const findings: Finding[] = messages.map((msg, index) => {
    const messageType = msg.type === "error" ? "serious" : "minor";
    const messageTraduzida = translateToPortuguese(msg.message);
    const title =
      msg.type === "error"
        ? "Erro de validação estrutural"
        : "Aviso estrutural";
    return {
      id: `w3c-html:${index + 1}`,
      source: "w3c",
      title,
      description: messageTraduzida.trim(),
      severity: normalizeSeverity(messageType),
      recommendation: recommendationFromContext(
        messageTraduzida,
        messageTraduzida,
      ),
      wcagRefs: mapW3cHtmlToWcag(msg.message),
      htmlElement: msg.extract,
    };
  });

  const errors = messages.filter((msg) => msg.type === "error").length;
  const warnings = messages.length - errors;

  return {
    url,
    checked: true,
    apiAvailable: true,
    findings,
    rawSummary: {
      errors,
      warnings,
    },
  };
}

export async function runW3CCssAudit(url: string): Promise<W3CAuditResult> {
  const data = await getCss(url);

  if (data === null) {
    return unavailableResult(url);
  }

  const cv = data.cssvalidation!;
  const errorList = cv.errors ?? [];
  const warningList = cv.warnings ?? [];

  const errorFindings = mapCssIssuesToFindings(errorList, "error");
  const warningFindings = mapCssIssuesToFindings(warningList, "warning");
  const findings = [...errorFindings, ...warningFindings].slice(
    0,
    MAX_CSS_FINDINGS,
  );

  return {
    url,
    checked: true,
    apiAvailable: true,
    findings,
    rawSummary: {
      errors: errorFindings.length,
      warnings: warningFindings.length,
    },
  };
}

function isW3cNetworkNoise(message: string): boolean {
  return W3C_NETWORK_NOISE.some((term) => message.includes(term));
}

function filterCssIssues(issues: CssValidationIssue[]): CssValidationIssue[] {
  const termsToFilter = [
    "Parse Error",
    "Too many values or values are not recognized",
    "is a vendor extension",
    "is a vendor-specific value",
    "is a vendor extended pseudo-element",
    "is a vendor extended pseudo-class",
    "Due to their dynamic nature, CSS variables are currently not statically checked",
    ...W3C_NETWORK_NOISE,
  ];
  const contextFilter = (item: CssValidationIssue) =>
    item.context !== "" && item.context !== null && item.context !== undefined;
  return issues.filter(
    (item) =>
      item.message.trim() !== "The types are incompatible" &&
      !termsToFilter.some((term) => item.message.includes(term)) &&
      contextFilter(item),
  );
}

function mapCssIssuesToFindings(
  issues: CssValidationIssue[],
  kind: "error" | "warning",
): Finding[] {
  return filterCssIssues(issues).map((item, index) => {
    const messageTraduzida = translateToPortuguese(item.message);
    const messageType = kind === "error" ? "serious" : "minor";
    const location =
      item.source && item.line != null
        ? `${item.source} (linha ${item.line})`
        : (item.source ?? "");
    const description = sanitizeDescription(messageTraduzida);

    return {
      id: `w3c-css:${kind}-${index + 1}`,
      source: "w3c-css" as const,
      title:
        kind === "error" ? "Erro de validação CSS" : "Aviso de validação CSS",
      description,
      severity: normalizeSeverity(messageType),
      recommendation: recommendationFromContext(
        messageTraduzida,
        item.type ?? "",
      ),
      wcagRefs: mapW3cCssToWcag(item.message, item.context, item.type),
      cssSelector: item.context,
      location,
    };
  });
}

function sanitizeDescription(description: string): string {
  const trimmed = description.trim();
  if (trimmed.endsWith(":")) {
    return trimmed.slice(0, -1);
  }
  return trimmed;
}

function mergeW3cResults(
  html: W3CAuditResult,
  css: W3CAuditResult,
  url: string,
): W3CAuditResult {
  return {
    url,
    checked: html.checked || css.checked,
    apiAvailable: html.apiAvailable || css.apiAvailable,
    findings: [...html.findings, ...css.findings],
    rawSummary: {
      errors: html.rawSummary.errors + css.rawSummary.errors,
      warnings: html.rawSummary.warnings + css.rawSummary.warnings,
    },
  };
}

function unavailableResult(url: string): W3CAuditResult {
  return {
    url,
    checked: false,
    apiAvailable: false,
    findings: [],
    rawSummary: {
      errors: 0,
      warnings: 0,
    },
  };
}
