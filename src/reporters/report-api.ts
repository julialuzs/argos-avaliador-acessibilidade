import { API_RELATORIOS_ENDPOINT } from "../config.js";
import http from "node:http";
import https from "node:https";
import type { ConsolidatedPipelineReport } from "./report-generator.js";

const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ReportRequest {
  projectId: string;
  report: ConsolidatedPipelineReport;
}

/**
 * Envia o relatório para a API Argos (POST /relatorios).
 * Body: { json: <relatório>, guidProjeto: <guid> }
 */
export async function sendReportToApi({
  projectId,
  report,
}: ReportRequest): Promise<void> {
  const guidProjeto = projectId.trim();
  if (!GUID_PATTERN.test(guidProjeto) || guidProjeto === "00000000-0000-0000-0000-000000000000") {
    throw new Error(`projectId inválido (esperado Guid público): ${projectId}`);
  }

  const endpoint = API_RELATORIOS_ENDPOINT.trim();
  if (!endpoint) {
    throw new Error("API_RELATORIOS_ENDPOINT vazio.");
  }

  const url = new URL(endpoint);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(`Protocolo invalido no endpoint da API: ${url.protocol}`);
  }

  const body = JSON.stringify({
    json: report,
    guidProjeto,
  });

  const isLocalHost =
    url.hostname === "localhost" || url.hostname === "127.0.0.1";
  const transport = url.protocol === "https:" ? https : http;

  await new Promise<void>((resolve, reject) => {
    const req = transport.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
        ...(url.protocol === "https:" && isLocalHost
          ? { rejectUnauthorized: false }
          : {}),
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const status = res.statusCode ?? 0;
          if (status >= 200 && status < 300) {
            resolve();
            return;
          }
          const detail = Buffer.concat(chunks).toString("utf-8");
          reject(
            new Error(
              `Falha ao enviar relatorio para ${endpoint}: HTTP ${status}${detail ? ` — ${detail}` : ""}`,
            ),
          );
        });
      },
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}
