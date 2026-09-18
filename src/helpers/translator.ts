interface TranslationRule {
  pattern: RegExp;
  replacement: string;
}

const RULES: TranslationRule[] = [
  {
    pattern: /\bDocument does not have a main landmark\b/gi,
    replacement: "Documento não possui landmark principal (main).",
  },
  {
    pattern: /\bDocument should have one main landmark\b/gi,
    replacement: "Documento deve ter uma landmark principal (main).",
  },
  {
    pattern: /\bAll page content should be contained by landmarks\b/gi,
    replacement: "Todo o conteudo da pagina deve estar contido em landmarks.",
  },
  {
    pattern: /\bForm elements must have labels\b/gi,
    replacement: "Elementos de formulario devem ter rotulos.",
  },
  {
    pattern: /\bLinks must have discernible text\b/gi,
    replacement: "Links devem ter texto identificavel.",
  },
  {
    pattern: /\bImages must have alternate text\b/gi,
    replacement: "Imagens devem ter texto alternativo.",
  },
  {
    pattern: /\bButtons must have discernible text\b/gi,
    replacement: "Botões devem ter texto identificável.",
  },
  {
    pattern: /\bHeading levels should only increase by one\b/gi,
    replacement: "Níveis de títulos devem aumentar de um em um.",
  },
  {
    pattern:
      /\bBackground and foreground colors do not have a sufficient contrast ratio\b/gi,
    replacement:
      "Cores de fundo e primeiro plano não possuem contraste suficiente.",
  },
  {
    pattern: /\bElements must meet minimum color contrast ratio thresholds\b/gi,
    replacement: "Elementos devem atender ao contraste mínimo de cores.",
  },
  {
    pattern: /\bPage must contain a level-one heading\b/gi,
    replacement: "Página deve conter um título de nível 1.",
  },
  {
    pattern: /\bAvoid large layout shifts\b/gi,
    replacement: "Evite grandes mudanças de layout.",
  },
  {
    pattern: /\bEnsure all ARIA attributes have valid values\b/gi,
    replacement: "Garanta que todos os atributos ARIA tenham valores válidos.",
  },
  {
    pattern: /\bARIA input fields must have an accessible name\b/gi,
    replacement: "Campos ARIA devem ter nome acessível.",
  },
];

export function translateToPortuguese(text: string): string {
  if (!text) return text;
  let translated = text;
  for (const rule of RULES) {
    translated = translated.replace(rule.pattern, rule.replacement);
  }
  return translated.replace(/\.\./g, ".").trim();
}

export function recommendationFromContext(
  title: string,
  description: string,
): string {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes("contrast") || text.includes("contraste"))
    return "Ajuste contraste de cores para atender WCAG AA.";
  if (
    text.includes("label") ||
    text.includes("rótulo") ||
    text.includes("rotulo")
  )
    return "Associe rótulos explícitos a todos os campos de formulário.";
  if (
    text.includes("heading") ||
    text.includes("título") ||
    text.includes("titulo")
  )
    return "Estruture títulos hierarquicamente sem saltos de nível.";
  if (text.includes("link"))
    return "Garanta texto de link descritivo e sem ambiguidade.";
  if (
    text.includes("keyboard") ||
    text.includes("focus") ||
    text.includes("teclado") ||
    text.includes("foco")
  )
    return "Assegure navegação completa por teclado e foco visível.";
  if (
    /\balt\b/.test(text) ||
    text.includes("texto alternativo") ||
    text.includes("alternate text") ||
    text.includes("image") ||
    text.includes("imagem")
  )
    return "Forneça texto alternativo significativo para imagens informativas.";

  return "Revise o item com base no critério WCAG correspondente e aplique correção no HTML/ARIA.";
}
