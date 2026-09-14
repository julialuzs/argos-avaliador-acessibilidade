export const BASE_W3C_HTML_CHECKER = "https://validator.w3.org/nu/";
export const BASE_W3C_CSS_CHECKER = "https://jigsaw.w3.org/css-validator";
export const MAX_CSS_FINDINGS = 150;

/** Mensagens do validador sobre falha de download, não sobre acessibilidade. */
export const W3C_NETWORK_NOISE = [
  "HTTP resource not retrievable",
  "The HTTP status from the remote server was",
];