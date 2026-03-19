/**
 * Worker lifecycle for Forms hosted MCP E2E tests.
 *
 * Spawns `npx wrangler dev` as a child process rather than using
 * unstable_dev, because OAuthProvider-wrapped workers hang when
 * accessed via unstable_dev's internal fetch mechanism.
 */

import { spawn, type ChildProcess } from "node:child_process";

const WORKER_PORT = 8789;

let workerProcess: ChildProcess | undefined;
let workerUrl: string | undefined;

export async function startWorker(): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Timed out waiting for wrangler dev to start"));
    }, 60000);

    workerProcess = spawn(
      "npx",
      [
        "wrangler", "dev",
        "--config", "tests/forms-hosted-e2e/wrangler.e2e.toml",
        "--port", String(WORKER_PORT),
      ],
      {
        cwd: process.cwd(),
        stdio: ["ignore", "pipe", "pipe"],
        detached: true,
        env: process.env as NodeJS.ProcessEnv,
      },
    );

    let output = "";

    workerProcess.stdout?.on("data", (data: Buffer) => {
      output += data.toString();
      if (output.includes("Ready on")) {
        clearTimeout(timer);
        workerUrl = `http://localhost:${WORKER_PORT}`;
        resolve(workerUrl);
      }
    });

    workerProcess.stderr?.on("data", (data: Buffer) => {
      output += data.toString();
      // wrangler prints ready message to stderr sometimes
      if (output.includes("Ready on")) {
        clearTimeout(timer);
        workerUrl = `http://localhost:${WORKER_PORT}`;
        resolve(workerUrl);
      }
    });

    workerProcess.on("error", (err) => {
      clearTimeout(timer);
      reject(new Error(`Wrangler dev failed to start: ${err.message}`));
    });

    workerProcess.on("exit", (code) => {
      if (!workerUrl) {
        clearTimeout(timer);
        reject(
          new Error(
            `Wrangler dev exited with code ${code} before ready.\nOutput: ${output}`,
          ),
        );
      }
    });
  });
}

export async function stopWorker(): Promise<void> {
  if (workerProcess) {
    const proc = workerProcess;
    workerProcess = undefined;
    workerUrl = undefined;

    try {
      process.kill(-proc.pid!, "SIGTERM");
    } catch {
      proc.kill("SIGTERM");
    }

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        try { process.kill(-proc.pid!, "SIGKILL"); } catch { /* ignore */ }
        resolve();
      }, 5000);
      proc.on("exit", () => { clearTimeout(timeout); resolve(); });
    });
  }
}

export function getWorkerUrl(): string {
  if (!workerUrl) {
    throw new Error("Worker not started. Call startWorker() first.");
  }
  return workerUrl;
}
