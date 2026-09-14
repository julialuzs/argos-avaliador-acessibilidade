import { chromium } from "playwright";
import type { Page } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import axe from "axe-core";
import type { Result } from "axe-core";
import ptBR from "axe-core/locales/pt_BR.json" with { type: "json" };
import { formatAxeWcagTags } from "../../mappers/wcag-mapper.js";
import { normalizeSeverity } from "../../mappers/severity-mapper.js";
// import { translateToPortuguese } from "../../config/translator.js";
import { writeRawApiReport } from "../../helpers/raw-report-writer.js";
import { AxeAuditResult, Finding } from "../types.js";
import { recommendationFromContext } from "../../helpers/translator.js";

/** axe-core source with pt_BR locale applied in the browser context. */
const axeSource = `${axe.source};axe.configure(${JSON.stringify({ locale: ptBR })});`;

export async function runAxeAudit(url: string): Promise<AxeAuditResult> {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    return await runAxeOnPage(page, url);
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
}

export async function runAxeOnPage(
  page: Page,
  urlForReport: string,
): Promise<AxeAuditResult> {
  const axeResults = await new AxeBuilder({ page, axeSource }).analyze();
  await writeRawApiReport("axe", urlForReport, axeResults);
  const findings = mapViolationsToFindings(axeResults.violations);

  return {
    url: urlForReport,
    findings,
    rawSummary: {
      violations: axeResults.violations.length,
      incomplete: axeResults.incomplete.length,
      passes: axeResults.passes.length,
    },
  };
}

function mapViolationsToFindings(violations: Result[]): Finding[] {
  return violations.map((violation: Result) => {
    // const translatedTitle = translateToPortuguese(violation.help);
    // const translatedDescription = translateToPortuguese(violation.description);
    // const description = `${violation.help}. Ajuda: ${violation.description}`;
    return {
      id: `axe:${violation.id}`,
      source: "axe",
      title: violation.help,
      description: violation.description,
      //   impact: violation.impact ?? "unknown",
      severity: normalizeSeverity(violation.impact ?? undefined),
      recommendation: recommendationFromContext(
        violation.help,
        violation.description,
      ),
      wcagRefs: formatAxeWcagTags(violation.tags),
      htmlElement: violation.nodes[0]?.html,
      helpUrl: `${violation.helpUrl}&lang=pt`,
      elementCount: violation.nodes.length,
    };
  });
}
