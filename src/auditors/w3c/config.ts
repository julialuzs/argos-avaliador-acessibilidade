export const BASE_W3C_HTML_CHECKER = "https://validator.w3.org/nu/";
export const BASE_W3C_CSS_CHECKER = "https://jigsaw.w3.org/css-validator";
export const W3C_USER_AGENT = "argos-avaliador-acessibilidade/1.0";
export const MAX_CSS_FINDINGS = 150;

export const W3C_MIN_INTERVAL_MS = 1_000;
export const W3C_MAX_RETRIES = 2;
export const W3C_REQUEST_TIMEOUT_MS = 30_000;
export const W3C_RETRY_MAX_WAIT_MS = 5_000;

export const W3C_NETWORK_NOISE = [
  "HTTP resource not retrievable",
  "The HTTP status from the remote server was",
];
