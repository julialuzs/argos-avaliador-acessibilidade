import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);

export async function ensurePlaywrightChromium(): Promise<void> {
  if (process.env.ARGOS_SKIP_BROWSER_INSTALL === "1") {
    return;
  }

  if (existsSync(chromium.executablePath()) && (await canLaunchChromium())) {
    return;
  }

  console.log("Chromium do Playwright não disponível. Instalando...");
  await installChromium();
}

async function canLaunchChromium(): Promise<boolean> {
  try {
    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
    });
    await browser.close();
    return true;
  } catch {
    return false;
  }
}

function installChromium(): Promise<void> {
  const cli = join(dirname(require.resolve("playwright/package.json")), "cli.js");

  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [cli, "install", "chromium", "--with-deps"],
      { stdio: "inherit" },
    );

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `Falha ao instalar Chromium do Playwright (código ${String(code)}).`,
        ),
      );
    });
  });
}
