interface TranslationRule {
  pattern: RegExp;
  replacement: string;
}

/** Aspas de abertura/fechamento do Nu Checker e aspas comuns. */
const OPEN = String.raw`[“"']`;
const CLOSE = String.raw`[”"']`;
const quoted = String.raw`${OPEN}([^”"']+)${CLOSE}`;

/**
 * Templates mais frequentes do W3C Nu HTML Checker.
 * Mensagens não reconhecidas permanecem em inglês.
 */
const RULES: TranslationRule[] = [
  {
    pattern: new RegExp(
      String.raw`^Element ${quoted} not allowed as child of element ${quoted} in this context\.(?: \(Suppressing further errors from this subtree\.\))?$`,
      "i",
    ),
    replacement:
      "O elemento “$1” não é permitido como filho do elemento “$2” neste contexto.",
  },
  {
    pattern: new RegExp(
      String.raw`^Attribute ${quoted} not allowed on element ${quoted} at this point\.$`,
      "i",
    ),
    replacement:
      "O atributo “$1” não é permitido no elemento “$2” neste ponto.",
  },
  {
    pattern: new RegExp(
      String.raw`^The ${quoted} attribute on the ${quoted} element is obsolete\. Use CSS instead\.$`,
      "i",
    ),
    replacement:
      "O atributo “$1” no elemento “$2” está obsoleto. Use CSS.",
  },
  {
    pattern: new RegExp(
      String.raw`^The ${quoted} attribute on the ${quoted} element is obsolete\. Consider specifying ${quoted} in CSS instead\.$`,
      "i",
    ),
    replacement:
      "O atributo “$1” no elemento “$2” está obsoleto. Considere especificar “$3” no CSS.",
  },
  {
    pattern: new RegExp(
      String.raw`^The ${quoted} element is obsolete\. Use CSS instead\.$`,
      "i",
    ),
    replacement: "O elemento “$1” está obsoleto. Use CSS.",
  },
  {
    pattern: new RegExp(
      String.raw`^The ${quoted} attribute on the ${quoted} element is obsolete\. Use the ${quoted} attribute instead\.$`,
      "i",
    ),
    replacement:
      "O atributo “$1” no elemento “$2” está obsoleto. Use o atributo “$3”.",
  },
  {
    pattern: new RegExp(
      String.raw`^The ${quoted} attribute on the ${quoted} element is obsolete\. Consider putting an ${quoted} attribute on the nearest container instead\.$`,
      "i",
    ),
    replacement:
      "O atributo “$1” no elemento “$2” está obsoleto. Considere colocar um atributo “$3” no contêiner mais próximo.",
  },
  {
    pattern: new RegExp(
      String.raw`^The ${quoted} attribute on the ${quoted} element is obsolete\. You can safely omit it\.$`,
      "i",
    ),
    replacement:
      "O atributo “$1” no elemento “$2” está obsoleto. Pode omiti-lo com segurança.",
  },
  {
    pattern: new RegExp(
      String.raw`^Element ${quoted} is missing required attribute ${quoted}\.$`,
      "i",
    ),
    replacement: "O elemento “$1” está sem o atributo obrigatório “$2”.",
  },
  {
    pattern: new RegExp(
      String.raw`^Bad value ${OPEN}([^”"']*)${CLOSE} for attribute ${quoted} on element ${quoted}(?:[:.]\s*(.*))?$`,
      "i",
    ),
    replacement: "Valor “$1” inválido para o atributo “$2” no elemento “$3”. $4",
  },
  {
    pattern: new RegExp(String.raw`^Duplicate ID ${quoted}\.$`, "i"),
    replacement: "ID duplicado: “$1”.",
  },
  {
    pattern: new RegExp(
      String.raw`^The first occurrence of ID ${quoted} was here\.$`,
      "i",
    ),
    replacement: "A primeira ocorrência do ID “$1” foi aqui.",
  },
  {
    pattern: new RegExp(String.raw`^Duplicate attribute ${quoted}\.$`, "i"),
    replacement: "Atributo duplicado: “$1”.",
  },
  {
    pattern: new RegExp(String.raw`^Stray end tag ${quoted}\.$`, "i"),
    replacement: "Tag de fechamento “$1” fora de contexto.",
  },
  {
    pattern: new RegExp(String.raw`^Stray start tag ${quoted}\.$`, "i"),
    replacement: "Tag de abertura “$1” fora de contexto.",
  },
  {
    pattern: new RegExp(String.raw`^Unclosed element ${quoted}\.$`, "i"),
    replacement: "Elemento “$1” não foi fechado.",
  },
  {
    pattern: new RegExp(
      String.raw`^Start tag ${quoted} seen in ${quoted}\.$`,
      "i",
    ),
    replacement: "Tag de abertura “$1” encontrada em “$2”.",
  },
  {
    pattern: new RegExp(
      String.raw`^Start tag ${quoted} seen but an element of the same type was already open\.$`,
      "i",
    ),
    replacement:
      "Tag de abertura “$1” encontrada, mas um elemento do mesmo tipo já estava aberto.",
  },
  {
    pattern: new RegExp(
      String.raw`^End tag ${quoted} seen, but there were open elements\.$`,
      "i",
    ),
    replacement:
      "Tag de fechamento “$1” encontrada, mas havia elementos abertos.",
  },
  {
    pattern: new RegExp(
      String.raw`^End tag for ${quoted} seen, but there were unclosed elements\.$`,
      "i",
    ),
    replacement:
      "Tag de fechamento de “$1” encontrada, mas havia elementos não fechados.",
  },
  {
    pattern: new RegExp(
      String.raw`^No ${quoted} element in scope but a ${quoted} end tag seen\.$`,
      "i",
    ),
    replacement:
      "Nenhum elemento “$1” no escopo, mas uma tag de fechamento “$2” foi encontrada.",
  },
  {
    pattern: new RegExp(
      String.raw`^Saw an end tag after ${quoted} had been closed\.$`,
      "i",
    ),
    replacement: "Tag de fechamento encontrada depois que “$1” já havia sido fechado.",
  },
  {
    pattern: new RegExp(
      String.raw`^An ${quoted} element must have an ${quoted} attribute, except under certain conditions\. For details, consult guidance on providing text alternatives for images\.$`,
      "i",
    ),
    replacement:
      "Um elemento “$1” deve ter um atributo “$2”, salvo em condições específicas. Consulte as orientações sobre texto alternativo para imagens.",
  },
  {
    pattern:
      /^Consider adding a [“"']lang[”"'] attribute to the [“"']html[”"'] start tag to declare the language of this document\.$/i,
    replacement:
      "Considere adicionar o atributo “lang” à tag de abertura “html” para declarar o idioma deste documento.",
  },
  {
    pattern:
      /^This document appears to be written in (.+?) but the [“"']html[”"'] start tag does not start with (.+)\. Consider adding (.+) to the [“"']html[”"'] start tag\.$/i,
    replacement:
      "Este documento parece estar escrito em $1, mas a tag de abertura “html” não começa com $2. Considere adicionar $3 à tag de abertura “html”.",
  },
  {
    pattern:
      /^Section lacks heading\. Consider using [“"']h2[”"']-[“"']h6[”"'] elements to add identifying headings to all sections, or else use a [“"']div[”"'] instead of a [“"']section[”"'] element\.$/i,
    replacement:
      "A seção não tem título. Considere usar elementos “h2”-“h6” para identificar todas as seções, ou use um “div” no lugar de “section”.",
  },
  {
    pattern:
      /^Section lacks heading\. Consider using [“"']h2[”"']-[“"']h6[”"'] elements to add identifying headings to all sections, or else use a [“"']div[”"'] element instead for any cases where no heading is needed\.$/i,
    replacement:
      "A seção não tem título. Considere usar elementos “h2”-“h6” para identificar todas as seções, ou use um “div” quando não for necessário um título.",
  },
  {
    pattern:
      /^Article lacks heading\. Consider using [“"']h2[”"']-[“"']h6[”"'] elements to add identifying headings to all articles, or else use a [“"']div[”"'] instead of an [“"']article[”"'] element\.$/i,
    replacement:
      "O artigo não tem título. Considere usar elementos “h2”-“h6” para identificar todos os artigos, ou use um “div” no lugar de “article”.",
  },
  {
    pattern: /^Empty heading\.$/i,
    replacement: "Título vazio.",
  },
  {
    pattern:
      /^Consider using the [“"']h1[”"'] element as a top-level heading only \(all [“"']h1[”"'] elements are treated as top-level headings by many screen readers and other tools\)\.$/i,
    replacement:
      "Considere usar o elemento “h1” apenas como título de nível superior (muitos leitores de tela tratam todos os “h1” como títulos de nível superior).",
  },
  {
    pattern:
      /^The value of the [“"']for[”"'] attribute of the [“"']label[”"'] element must be the ID of a non-hidden form control\.$/i,
    replacement:
      "O valor do atributo “for” do elemento “label” deve ser o ID de um controle de formulário visível.",
  },
  {
    pattern:
      /^The [“"']for[”"'] attribute of the [“"']label[”"'] element must refer to a non-hidden form control\.$/i,
    replacement:
      "O atributo “for” do elemento “label” deve apontar para um controle de formulário visível.",
  },
  {
    pattern: new RegExp(
      String.raw`^Element ${quoted} must not appear as a descendant of the ${quoted} element\.$`,
      "i",
    ),
    replacement: "O elemento “$1” não deve aparecer como descendente do elemento “$2”.",
  },
  {
    pattern: new RegExp(
      String.raw`^The ${quoted} element must come before any ${quoted} or ${quoted} elements in the document\.$`,
      "i",
    ),
    replacement:
      "O elemento “$1” deve vir antes de qualquer elemento “$2” ou “$3” no documento.",
  },
  {
    pattern:
      /^A document must not include more than one visible [“"']main[”"'] element\.$/i,
    replacement:
      "Um documento não deve incluir mais de um elemento “main” visível.",
  },
  {
    pattern:
      /^A [“"']script[”"'] element with [“"']type=module[”"'] must not have a [“"']defer[”"'] attribute\.$/i,
    replacement:
      "Um elemento “script” com “type=module” não deve ter o atributo “defer”.",
  },
  {
    pattern:
      /^A document must not include both a [“"']meta[”"'] element with an [“"']http-equiv[”"'] attribute whose value is [“"']content-type[”"'], and a [“"']meta[”"'] element with a [“"']charset[”"'] attribute\.$/i,
    replacement:
      "Um documento não deve incluir ao mesmo tempo um elemento “meta” com atributo “http-equiv” cujo valor é “content-type” e um elemento “meta” com atributo “charset”.",
  },
  {
    pattern:
      /^The [“"']type[”"'] attribute is unnecessary for JavaScript resources\.$/i,
    replacement: "O atributo “type” é desnecessário para recursos JavaScript.",
  },
  {
    pattern:
      /^The [“"']type[”"'] attribute for the [“"']style[”"'] element is not needed and should be omitted\.$/i,
    replacement:
      "O atributo “type” no elemento “style” não é necessário e deve ser omitido.",
  },
  {
    pattern:
      /^Trailing slash on void elements has no effect and interacts badly with unquoted attribute values\.$/i,
    replacement:
      "A barra final em elementos void não tem efeito e interage mal com valores de atributo sem aspas.",
  },
  {
    pattern:
      /^Self-closing syntax \([“"']\/>[”"']\) used on a non-void HTML element\. Ignoring the slash and treating as a start tag\.$/i,
    replacement:
      "Sintaxe de auto-fechamento (“/>”) usada em um elemento HTML que não é void. A barra será ignorada e a tag tratada como abertura.",
  },
  {
    pattern:
      /^The character encoding was not declared\. Proceeding using [“"']([^”"']+)[”"']\.$/i,
    replacement:
      "A codificação de caracteres não foi declarada. Prosseguindo com “$1”.",
  },
  {
    pattern:
      /^Internal encoding declaration [“"']([^”"']+)[”"'] disagrees with the actual encoding of the document \([“"']([^”"']+)[”"']\)\.$/i,
    replacement:
      "A declaração interna de codificação “$1” discrepa da codificação real do documento (“$2”).",
  },
  {
    pattern:
      /^A [“"']charset[”"'] attribute on a meta element found after the first 1024 bytes\.$/i,
    replacement:
      "Um atributo “charset” em um elemento meta foi encontrado depois dos primeiros 1024 bytes.",
  },
  {
    pattern: /^Almost standards mode doctype\. Expected [“"']<!DOCTYPE html>[”"']\.$/i,
    replacement:
      "Doctype em modo quase-padrão. O esperado era “<!DOCTYPE html>”.",
  },
  {
    pattern: /^Quirks [Mm]ode doctype\. Expected [“"']<!DOCTYPE html>[”"']\.$/i,
    replacement: "Doctype em quirks mode. O esperado era “<!DOCTYPE html>”.",
  },
  {
    pattern: /^Obsolete doctype\. Expected [“"']<!DOCTYPE html>[”"']\.$/i,
    replacement: "Doctype obsoleto. O esperado era “<!DOCTYPE html>”.",
  },
  {
    pattern: /^Legacy doctype\. Expected [“"']<!DOCTYPE html>[”"']\.$/i,
    replacement: "Doctype legado. O esperado era “<!DOCTYPE html>”.",
  },
  {
    pattern: /^Stray doctype\.$/i,
    replacement: "Doctype fora de contexto.",
  },
  {
    pattern:
      /^Cannot recover after last error\. Any further errors will be ignored\.$/i,
    replacement:
      "Não foi possível recuperar após o último erro. Os demais erros serão ignorados.",
  },
  {
    pattern: /^No space between attributes\.$/i,
    replacement: "Não há espaço entre atributos.",
  },
  {
    pattern:
      /^Named character reference was not terminated by a semicolon\. \(Or [“"']&[”"'] should have been escaped as [“"']&amp;[”"']\.\)\.$/i,
    replacement:
      "A referência de caractere nomeada não foi terminada por ponto e vírgula. (Ou “&” deveria ter sido escapado como “&amp;”.)",
  },
  {
    pattern: new RegExp(
      String.raw`^A table row was (\d+) columns wide, which is less than the column count established \((\d+)\)\.$`,
      "i",
    ),
    replacement:
      "Uma linha da tabela tinha $1 colunas, menos do que a contagem de colunas estabelecida ($2).",
  },
  {
    pattern:
      /^The [“"']button[”"'] role is unnecessary for element [“"']button[”"']\.$/i,
    replacement: "O papel “button” é desnecessário para o elemento “button”.",
  },
];

const FRAGMENTS: TranslationRule[] = [
  {
    pattern: /Expected a digit but saw [“"']([^”"']+)[”"'] instead\./gi,
    replacement: "Era esperado um dígito, mas foi encontrado “$1”.",
  },
  {
    pattern: /Must be non-negative\./gi,
    replacement: "Deve ser não negativo.",
  },
  {
    pattern: /An ID must not be the empty string\./gi,
    replacement: "Um ID não pode ser uma string vazia.",
  },
  {
    pattern: /Illegal character in query[:.]?\s*Space is not allowed\./gi,
    replacement: "Caractere ilegal na query. Espaço não é permitido.",
  },
  {
    pattern: /\bSubtype missing\.?/gi,
    replacement: "Subtipo ausente.",
  },
  {
    pattern: /\(Suppressing further errors from this subtree\.\)/gi,
    replacement: "(Outros erros desta subárvore serão omitidos.)",
  },
];

export function translateW3cHtmlMessage(text: string): string {
  if (!text) return text;

  let translated = text;
  for (const rule of RULES) {
    const next = translated.replace(rule.pattern, rule.replacement);
    if (next !== translated) {
      translated = next;
      break;
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
