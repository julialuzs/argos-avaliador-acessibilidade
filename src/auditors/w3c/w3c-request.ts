import {
  W3C_MAX_RETRIES,
  W3C_MIN_INTERVAL_MS,
  W3C_REQUEST_TIMEOUT_MS,
  W3C_RETRY_MAX_WAIT_MS,
  W3C_USER_AGENT,
} from "./config.js";

const nextAllowedAt = new Map<string, number>();
const hostQueue = new Map<string, Promise<unknown>>();

export async function fetchW3cJson<T>(endpoint: string): Promise<T | null> {
  const host = new URL(endpoint).host;

  return enqueue(host, async () => {
    for (let attempt = 0; attempt <= W3C_MAX_RETRIES; attempt++) {
      await waitForHostSlot(host);

      try {
        const response = await fetch(endpoint, {
          headers: { "user-agent": W3C_USER_AGENT },
          signal: AbortSignal.timeout(W3C_REQUEST_TIMEOUT_MS),
        });

        markHostUsed(host);

        const contentType = response.headers.get("content-type") ?? "";
        if (
          (response.status === 403 ||
            response.status === 429 ||
            response.status === 503) &&
          contentType.includes("text/html")
        ) {
          console.warn(
            `Validador W3C público (${host}) bloqueado (HTTP ${response.status}).`,
          );
          return null;
        }

        if (response.status === 429 || response.status === 503) {
          if (attempt < W3C_MAX_RETRIES) {
            await sleep(retryDelayMs(response, attempt));
            continue;
          }

          console.warn(
            `Validador W3C (${host}) indisponível (HTTP ${response.status}).`,
          );
          return null;
        }

        if (!response.ok) {
          console.warn(
            `Validador W3C (${host}) retornou HTTP ${response.status}.`,
          );
          return null;
        }

        return (await response.json()) as T;
      } catch (err: unknown) {
        markHostUsed(host);
        console.warn(
          `Validador W3C (${host}) falhou: ${err instanceof Error ? err.message : String(err)}`,
        );
        return null;
      }
    }

    return null;
  });
}

function enqueue<T>(host: string, task: () => Promise<T>): Promise<T> {
  const previous = hostQueue.get(host) ?? Promise.resolve();
  const current = previous.catch(() => undefined).then(task);
  hostQueue.set(host, current);
  return current;
}

async function waitForHostSlot(host: string): Promise<void> {
  const waitMs = (nextAllowedAt.get(host) ?? 0) - Date.now();
  if (waitMs > 0) {
    await sleep(waitMs);
  }
}

function markHostUsed(host: string): void {
  nextAllowedAt.set(host, Date.now() + W3C_MIN_INTERVAL_MS);
}

function retryDelayMs(response: Response, attempt: number): number {
  const retryAfter = response.headers.get("retry-after");
  if (retryAfter) {
    const seconds = Number.parseInt(retryAfter, 10);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.min(seconds * 1_000, W3C_RETRY_MAX_WAIT_MS);
    }
  }

  return Math.min(W3C_MIN_INTERVAL_MS * (attempt + 1), W3C_RETRY_MAX_WAIT_MS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
