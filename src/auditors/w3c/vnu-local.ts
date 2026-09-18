import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import type { W3CResponse } from "./types.js";

const require = createRequire(import.meta.url);
const vnuJarPath = String(require("vnu-jar"));

export async function checkHtmlWithVnu(html: string): Promise<W3CResponse | null> {
  return runVnu(["--format", "json", "--exit-zero-always", "-"], html);
}

export async function checkCssWithVnu(css: string): Promise<W3CResponse | null> {
  if (!css.trim()) {
    return { messages: [] };
  }

  return runVnu(
    ["--css", "--format", "json", "--exit-zero-always", "-"],
    css,
  );
}

function runVnu(args: string[], input: string): Promise<W3CResponse | null> {
  return new Promise((resolve) => {
    const child = spawn("java", ["-jar", vnuJarPath, ...args], {
      windowsHide: true,
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];

    child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
    child.on("error", (err) => {
      console.warn(`Validador W3C local indisponível: ${err.message}`);
      resolve(null);
    });
    child.on("close", (code) => {
      const out = Buffer.concat(stdout).toString("utf8").trim();
      const errText = Buffer.concat(stderr).toString("utf8").trim();
      const payload = out.startsWith("{") ? out : errText;

      if (!payload.startsWith("{")) {
        console.warn(
          `Validador W3C local não retornou JSON (código ${code})${errText ? `: ${errText.slice(0, 300)}` : "."}`,
        );
        resolve(null);
        return;
      }

      try {
        resolve(JSON.parse(payload) as W3CResponse);
      } catch {
        console.warn(`Validador W3C local retornou JSON inválido (código ${code}).`);
        resolve(null);
      }
    });

    child.stdin.on("error", () => {
      /* processo pode encerrar antes do fim do stdin */
    });
    child.stdin.end(input, "utf8");
  });
}
