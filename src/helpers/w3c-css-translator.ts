interface TranslationRule {
  pattern: RegExp;
  replacement: string;
}

const OPEN = String.raw`[“"']`;
const CLOSE = String.raw`[”"']`;
const quoted = String.raw`${OPEN}([^”"']+)${CLOSE}`;

/**
 * Templates do Nu Html Checker / CSS Validator.
 * O prefixo "CSS:" é opcional.
 */
const RULES: TranslationRule[] = [
  {
    pattern: new RegExp(
      String.raw`^(?:CSS:\s*)?${quoted}:\s*${quoted} is not a ${quoted} value\.?$`,
      "i",
    ),
    replacement: "CSS: “$1”: “$2” não é um valor de “$3”.",
  },
  {
    pattern: new RegExp(
      String.raw`^(?:CSS:\s*)?${quoted}:\s*Too many values or values are not recognized\.?$`,
      "i",
    ),
    replacement:
      "CSS: “$1”: presença de muitos valores ou valores não reconhecidos.",
  },
  {
    pattern: new RegExp(
      String.raw`^(?:CSS:\s*)?${quoted}:\s*Property ${quoted} doesn't exist\.?$`,
      "i",
    ),
    replacement: "CSS: “$1”: a propriedade “$2” não existe.",
  },
  {
    pattern: new RegExp(
      String.raw`^(?:CSS:\s*)?Property ${quoted} doesn't exist\.?$`,
      "i",
    ),
    replacement: "CSS: a propriedade “$1” não existe.",
  },
  {
    pattern: new RegExp(
      String.raw`^(?:CSS:\s*)?The media ${quoted} has been deprecated\.?$`,
      "i",
    ),
    replacement: "CSS: a mídia “$1” está em desuso.",
  },
  {
    pattern: new RegExp(
      String.raw`^(?:CSS:\s*)?Deprecated media feature ${quoted}\. For guidance, see the Deprecated Media Features section in the current Media Queries specification\.?$`,
      "i",
    ),
    replacement:
      "CSS: a característica de mídia “$1” está em desuso. Consulte a seção Deprecated Media Features da especificação atual de Media Queries.",
  },
  {
    pattern:
      /^(?:CSS:\s*)?@import are not allowed after any valid statement other than @charset and @import\.?$/i,
    replacement:
      "CSS: não é permitido @import após qualquer declaração que não seja @charset ou outra @import.",
  },
  {
    pattern: new RegExp(
      String.raw`^(?:CSS:\s*)?${quoted}:\s*Parse Error\.?$`,
      "i",
    ),
    replacement: "CSS: “$1”: erro de parseamento.",
  },
  {
    pattern: /^(?:CSS:\s*)?Parse Error\.?$/i,
    replacement: "CSS: erro de parseamento.",
  },
  {
    pattern: new RegExp(
      String.raw`^(?:CSS:\s*)?Unknown (?:at-rule|@-rule) ${quoted}\.?$`,
      "i",
    ),
    replacement: "CSS: at-rule “$1” desconhecida.",
  },
  {
    pattern: new RegExp(
      String.raw`^(?:CSS:\s*)?${quoted}:\s*only 0 can be a length\. You must put a unit after your number.*$`,
      "i",
    ),
    replacement:
      "CSS: “$1”: somente 0 pode ser um comprimento sem unidade. Informe a unidade após o número.",
  },
  {
    pattern: new RegExp(
      String.raw`^(?:CSS:\s*)?${quoted} is a vendor extension\.?$`,
      "i",
    ),
    replacement: "CSS: “$1” é uma extensão proprietária.",
  },
  {
    pattern:
      /^(?:CSS:\s*)?Attempt to find a semicolon before the property.*$/i,
    replacement:
      "CSS: tentativa de encontrar um ponto e vírgula antes da propriedade.",
  },
  {
    pattern:
      /^Document uses the Unicode Private Use Area\(s\), which should not be used in publicly exchanged documents\. \(Charmod C073\)$/i,
    replacement:
      "O documento usa a Área de Uso Privado do Unicode, que não deve ser usada em documentos públicos. (Charmod C073)",
  },
];

const FRAGMENTS: TranslationRule[] = [
  {
    pattern: /is not a [“"']([^”"']+)[”"'] value/gi,
    replacement: "não é um valor de “$1”",
  },
  {
    pattern: /Too many values or values are not recognized\.?/gi,
    replacement: "presença de muitos valores ou valores não reconhecidos.",
  },
  {
    pattern: /has been deprecated/gi,
    replacement: "está em desuso",
  },
  {
    pattern: /Parse Error/gi,
    replacement: "erro de parseamento",
  },
];

export function translateW3cCssMessage(text: string): string {
  if (!text) return text;

  let translated = text;
  for (const rule of RULES) {
    const next = translated.replace(rule.pattern, rule.replacement);
    if (next !== translated) {
      return cleanup(next);
    }
  }

  for (const rule of FRAGMENTS) {
    translated = translated.replace(rule.pattern, rule.replacement);
  }
  return cleanup(translated);
}

function cleanup(text: string): string {
  return text.replace(/\s+\./g, ".").replace(/\.\./g, ".").trim();
}
