import { BASE_W3C_CSS_CHECKER, BASE_W3C_HTML_CHECKER } from "./config.js";
import { CssValidationPayload, W3CResponse } from "./types.js";
import { fetchW3cJson } from "./w3c-request.js";
import { checkCssWithVnu, checkHtmlWithVnu } from "./vnu-local.js";

export async function getHtml(
  url: string,
  documentHtml?: string,
): Promise<W3CResponse | null> {
  if (documentHtml) {
    const local = await checkHtmlWithVnu(documentHtml);
    if (local) {
      return local;
    }
  }

  const endpoint = `${BASE_W3C_HTML_CHECKER}?doc=${encodeURIComponent(url)}&out=json`;
  return fetchW3cJson<W3CResponse>(endpoint);
}

export async function getCss(
  url: string,
  documentCss?: string,
): Promise<W3CResponse | CssValidationPayload | null> {
  if (documentCss != null) {
    const local = await checkCssWithVnu(documentCss);
    if (local) {
      return local;
    }
  }

  const endpoint = `${BASE_W3C_CSS_CHECKER}/validator?uri=${encodeURIComponent(url)}&output=json&profile=css3svg&lang=pt-BR`;
  return fetchW3cJson<CssValidationPayload>(endpoint);
}
