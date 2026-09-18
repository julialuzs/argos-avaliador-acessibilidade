import {
  mapW3cCssToWcag,
  mapW3cHtmlToWcag,
} from "../../mappers/wcag-mapper.js";
import { severityFromW3c } from "../../mappers/severity-mapper.js";
import { recommendationFromContext } from "../../helpers/translator.js";
import { translateW3cHtmlMessage } from "../../helpers/w3c-html-translator.js";
import { translateW3cCssMessage } from "../../helpers/w3c-css-translator.js";
import {
  CssValidationIssue,
  CssValidationPayload,
  W3CAuditResult,
  W3CMessage,
  W3CResponse,
} from "./types.js";
import { Finding } from "../types.js";
import { MAX_CSS_FINDINGS, W3C_NETWORK_NOISE } from "./config.js";
import { getCss, getHtml } from "./w3c.service.js";

export async function runW3CAudit(
  url: string,
  pageSource?: { html: string; css: string },
): Promise<W3CAuditResult> {
  const [html, css] = await Promise.all([
    runW3CHtmlAudit(url, pageSource?.html),
    runW3CCssAudit(url, pageSource?.css),
  ]);
  return mergeW3cResults(html, css, url);
}

export async function runW3CHtmlAudit(
  url: string,
  documentHtml?: string,
): Promise<W3CAuditResult> {
  const data = await getHtml(url, documentHtml);

  if (data === null) {
    return unavailableResult(url);
  }

  return mapVnuMessages(url, data.messages ?? [], "w3c");
}

export async function runW3CCssAudit(
  url: string,
  documentCss?: string,
): Promise<W3CAuditResult> {
  const data = await getCss(url, documentCss);

  if (data === null) {
    return unavailableResult(url);
  }

  if (isVnuCssResponse(data)) {
    const messages = (data.messages ?? []).filter(
      (msg) => !isCssNoise(msg.message),
    );
    return mapVnuMessages(url, messages, "w3c-css");
  }

  const cv = data.cssvalidation;
  if (!cv) {
    return unavailableResult(url);
  }

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

function isVnuCssResponse(
  data: W3CResponse | CssValidationPayload,
): data is W3CResponse {
  return Array.isArray((data as W3CResponse).messages);
}

function mapVnuMessages(
  url: string,
  messages: W3CMessage[],
  source: "w3c" | "w3c-css",
): W3CAuditResult {
  const filtered = messages.filter(
    (msg) => msg.message && !isW3cNetworkNoise(msg.message),
  );
  const findings: Finding[] = filtered.map((msg, index) => {
    const kind = msg.type === "error" ? "error" : "warning";
    const messageTraduzida =
      source === "w3c-css"
        ? translateW3cCssMessage(msg.message)
        : translateW3cHtmlMessage(msg.message);
    const title =
      source === "w3c-css"
        ? kind === "error"
          ? "Erro de validação CSS"
          : "Aviso de validação CSS"
        : kind === "error"
          ? "Erro de validação estrutural"
          : "Aviso estrutural";
    return {
      id: `${source}:${index + 1}`,
      source,
      title,
      description: messageTraduzida.trim(),
      severity: severityFromW3c(kind, source === "w3c-css" ? "css" : "html"),
      recommendation: recommendationFromContext(msg.message, messageTraduzida),
      wcagRefs:
        source === "w3c-css"
          ? mapW3cCssToWcag(msg.message)
          : mapW3cHtmlToWcag(msg.message),
      htmlElement: source === "w3c" ? msg.extract : undefined,
      cssSelector: source === "w3c-css" ? msg.extract : undefined,
    };
  });

  const errors = filtered.filter((msg) => msg.type === "error").length;

  return {
    url,
    checked: true,
    apiAvailable: true,
    findings:
      source === "w3c-css" ? findings.slice(0, MAX_CSS_FINDINGS) : findings,
    rawSummary: {
      errors,
      warnings: filtered.length - errors,
    },
  };
}

function isW3cNetworkNoise(message: string): boolean {
  return W3C_NETWORK_NOISE.some((term) => message.includes(term));
}

function isCssNoise(message: string): boolean {
  return /parse error/i.test(message);
}

function filterCssIssues(issues: CssValidationIssue[]): CssValidationIssue[] {
  const termsToFilter = [
    "Parse Error",
    "Erro de parseamento",
    "Too many values or values are not recognized",
    "Presença de muitos valores ou valores não reconhecidos",
    "is a vendor extension",
    "is a vendor-specific value",
    "is a vendor extended pseudo-element",
    "is a vendor extended pseudo-class",
    "propriedade proprietária",
    "pseudoclasse proprietária",
    "pseudoelemento proprietário",
    "Due to their dynamic nature, CSS variables are currently not statically checked",
    "Valores gerados dinâmicamente",
    ...W3C_NETWORK_NOISE,
  ];
  const contextFilter = (item: CssValidationIssue) =>
    item.context !== "" && item.context !== null && item.context !== undefined;
  const message = (item: CssValidationIssue) => item.message.trim();
  return issues.filter(
    (item) =>
      message(item) !== "The types are incompatible" &&
      message(item) !== "Os tipos são incompatíveis." &&
      !termsToFilter.some((term) => item.message.includes(term)) &&
      contextFilter(item),
  );
}

function mapCssIssuesToFindings(
  issues: CssValidationIssue[],
  kind: "error" | "warning",
): Finding[] {
  return filterCssIssues(issues).map((item, index) => {
    const location =
      item.source && item.line != null
        ? `${item.source} (linha ${item.line})`
        : (item.source ?? "");
    const description = sanitizeDescription(
      translateW3cCssMessage(item.message),
    );

    return {
      id: `w3c-css:${kind}-${index + 1}`,
      source: "w3c-css" as const,
      title:
        kind === "error" ? "Erro de validação CSS" : "Aviso de validação CSS",
      description,
      severity: severityFromW3c(kind, "css"),
      recommendation: recommendationFromContext(item.message, item.type ?? ""),
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
