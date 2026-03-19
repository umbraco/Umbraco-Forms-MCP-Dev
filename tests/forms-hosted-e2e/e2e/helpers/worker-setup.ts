/**
 * Worker lifecycle for Forms hosted MCP E2E tests.
 *
 * Starts the real Forms worker (src/worker.ts) which includes
 * both Forms tool collections and in-process CMS chaining.
 */

import { unstable_dev, type Unstable_DevWorker } from "wrangler";

let worker: Unstable_DevWorker | undefined;
let workerUrl: string | undefined;

const BASE_VARS = {
  UMBRACO_BASE_URL: "https://localhost:44374",
  UMBRACO_SERVER_URL: "http://localhost:17813",
  UMBRACO_OAUTH_CLIENT_ID: "umbraco-mcp-forms-hosted",
  COOKIE_ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  ENABLE_INFO_ENDPOINT: "true",
};

export async function startWorker(varsOverride?: Record<string, string>): Promise<string> {
  worker = await unstable_dev("src/worker.ts", {
    config: "tests/forms-hosted-e2e/wrangler.e2e.toml",
    port: 8789,
    experimental: { disableExperimentalWarning: true },
    vars: { ...BASE_VARS, ...varsOverride },
    logLevel: "error",
  });

  const address = worker.address;
  const port = worker.port;
  workerUrl = `http://${address}:${port}`;
  return workerUrl;
}

export async function stopWorker(): Promise<void> {
  if (worker) {
    await worker.stop();
    worker = undefined;
    workerUrl = undefined;
  }
}

export function getWorkerUrl(): string {
  if (!workerUrl) {
    throw new Error("Worker not started. Call startWorker() first.");
  }
  return workerUrl;
}
