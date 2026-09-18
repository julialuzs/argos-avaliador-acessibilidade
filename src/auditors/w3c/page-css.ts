import type { Page } from "playwright";

export async function collectPageCss(page: Page): Promise<string> {
  const inline = await page.evaluate(() =>
    [...document.querySelectorAll("style")]
      .map((el) => el.textContent ?? "")
      .join("\n"),
  );

  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll('link[rel~="stylesheet"]')].map(
      (el) => (el as HTMLLinkElement).href,
    ),
  );

  const sheets: string[] = [];
  for (const href of hrefs) {
    if (!href) continue;
    try {
      const response = await page.request.get(href, { timeout: 15_000 });
      if (response.ok()) {
        sheets.push(await response.text());
      }
    } catch {
      /* folha de estilo inacessível */
    }
  }

  return [inline, ...sheets].filter((chunk) => chunk.trim()).join("\n\n");
}
