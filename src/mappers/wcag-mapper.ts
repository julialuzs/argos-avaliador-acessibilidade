const AXE_SC_TAG = /^wcag(\d)(\d)(\d+)$/i;
const FORMATTED_SC = /^(\d+)\.(\d+)\.(\d+)$/;

/** 4.1.1 foi removido na WCAG 2.2; problemas restantes caem em 1.3.1 / 4.1.2. */
const OBSOLETE_CRITERIA = new Set(["4.1.1"]);

type WcagMapping = { pattern: RegExp; criteria: string[] };

/**
 * Só critérios WCAG 2.2 ainda vigentes.
 * Validação genérica de HTML/CSS não mapeia para SC — o antigo 4.1.1 (Parsing) foi removido.
 */
const W3C_HTML_MAPPINGS: WcagMapping[] = [
  {
    pattern: /\balt\b|texto alternativo|alternative text|\bimg\b/i,
    criteria: ["1.1.1"],
  },
  {
    pattern: /\blang\b|xml:lang|idioma da p[aá]gina|language of (the )?page/i,
    criteria: ["3.1.1"],
  },
  {
    pattern: /duplicate id|id duplicad|duplicate attribute/i,
    criteria: ["1.3.1", "4.1.2"],
  },
  {
    pattern: /\blabel\b|r[oó]tulo|for attribute/i,
    criteria: ["1.3.1", "3.3.2", "4.1.2"],
  },
  {
    pattern: /\bheading\b|n[ií]vel de t[ií]tulo|\bh[1-6]\b|section lacks heading/i,
    criteria: ["1.3.1", "2.4.6"],
  },
  {
    pattern: /\btable\b|\bth\b|\bthead\b|headers|caption|scope=/i,
    criteria: ["1.3.1"],
  },
  {
    pattern: /\biframe\b|\bframe\b/i,
    criteria: ["2.4.1", "4.1.2"],
  },
  {
    pattern: /\baria[\w-]*\b|\brole\b/i,
    criteria: ["4.1.2"],
  },
  {
    pattern: /\bbutton\b|accessible name|nome acess[ií]vel/i,
    criteria: ["4.1.2"],
  },
  {
    pattern: /\b(input|select|textarea|form control|fieldset|legend)\b/i,
    criteria: ["1.3.1", "3.3.2", "4.1.2"],
  },
  {
    pattern: /\btabindex\b/i,
    criteria: ["2.1.1", "2.4.3"],
  },
  {
    pattern: /figcaption|\bfigure\b/i,
    criteria: ["1.1.1", "1.3.1"],
  },
  {
    pattern:
      /not allowed as child|content model|stray (end|start) tag|unclosed element|open elements/i,
    criteria: ["1.3.1"],
  },
  {
    pattern: /required attribute|missing required|must have an?\s+|bad value/i,
    criteria: ["4.1.2"],
  },
];

const W3C_CSS_MAPPINGS: WcagMapping[] = [
  { pattern: /outline|:focus|focus-visible/i, criteria: ["2.4.7"] },
  { pattern: /\bcolor\b|background|contraste|contrast/i, criteria: ["1.4.3"] },
  { pattern: /font-size/i, criteria: ["1.4.4"] },
  { pattern: /\bcontent\b/i, criteria: ["1.1.1"] },
];

/**
 * Converte tags do axe-core (`wcag143`, `wcag2aa`) em critérios pontuados (`1.4.3`).
 * Tags de nível e o SC 4.1.1 (obsoleto na WCAG 2.2) são ignoradas.
 */
export function formatAxeWcagTags(tags: string[]): string[] {
  return uniqueSorted(
    tags.map(formatWcagRef).filter((ref): ref is string => Boolean(ref)),
  );
}

export function mapW3cHtmlToWcag(message: string): string[] {
  return applyMappings(message, W3C_HTML_MAPPINGS);
}

export function mapW3cCssToWcag(
  message: string,
  context?: string,
  type?: string,
): string[] {
  return applyMappings(
    `${message} ${context ?? ""} ${type ?? ""}`,
    W3C_CSS_MAPPINGS,
  );
}

export function formatWcagRef(raw: string): string | undefined {
  const tag = raw.trim();
  if (!tag) return undefined;

  let formatted: string | undefined;

  const already = FORMATTED_SC.exec(tag);
  if (already) {
    formatted = `${already[1]}.${already[2]}.${Number(already[3])}`;
  } else {
    const axe = AXE_SC_TAG.exec(tag);
    if (!axe) return undefined;
    formatted = `${axe[1]}.${axe[2]}.${Number(axe[3])}`;
  }

  if (!formatted || OBSOLETE_CRITERIA.has(formatted)) {
    return undefined;
  }

  return formatted;
}

function applyMappings(haystack: string, mappings: WcagMapping[]): string[] {
  const matches = new Set<string>();
  for (const mapping of mappings) {
    if (mapping.pattern.test(haystack)) {
      mapping.criteria.forEach((criterion) => {
        if (!OBSOLETE_CRITERIA.has(criterion)) {
          matches.add(criterion);
        }
      });
    }
  }
  return uniqueSorted(Array.from(matches));
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort(compareWcagCodes);
}

function compareWcagCodes(a: string, b: string): number {
  const [a1, a2, a3] = a.split(".").map((n) => Number.parseInt(n, 10));
  const [b1, b2, b3] = b.split(".").map((n) => Number.parseInt(n, 10));
  if (a1 !== b1) return (a1 || 0) - (b1 || 0);
  if (a2 !== b2) return (a2 || 0) - (b2 || 0);
  return (a3 || 0) - (b3 || 0);
}
