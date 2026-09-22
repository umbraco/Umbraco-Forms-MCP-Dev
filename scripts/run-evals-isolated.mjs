#!/usr/bin/env node
/**
 * Runs eval tests with `.mcp.json` temporarily out of the way.
 *
 * The Claude Agent SDK's query() (used internally by @umbraco-cms/mcp-server-sdk's
 * eval runner) auto-discovers project-level MCP config from `cwd`. Since `.mcp.json`
 * registers this same server again under the name "umbraco", every eval run was
 * connecting to it twice — once via the SDK's own explicit, filtered connection, and
 * once via the unfiltered `.mcp.json` entry — doubling the tool surface and letting
 * the LLM call the duplicate instead of the intended tool, which broke requiredTools
 * assertions and inflated token/cost per scenario.
 */
import { existsSync, renameSync } from "node:fs";
import { spawnSync } from "node:child_process";

const MCP_CONFIG = ".mcp.json";
const MCP_BACKUP = ".mcp.json.evals-bak";

let moved = false;
if (existsSync(MCP_CONFIG)) {
  renameSync(MCP_CONFIG, MCP_BACKUP);
  moved = true;
}

process.on("exit", () => {
  if (moved && existsSync(MCP_BACKUP)) {
    renameSync(MCP_BACKUP, MCP_CONFIG);
  }
});
process.on("SIGINT", () => process.exit(130));
process.on("SIGTERM", () => process.exit(143));

const result = spawnSync(
  process.execPath,
  [
    "--experimental-vm-modules",
    "node_modules/jest/bin/jest.js",
    "--config",
    "tests/evals/jest.config.ts",
    "--runInBand",
    "--forceExit",
    ...process.argv.slice(2),
  ],
  { stdio: "inherit" },
);

process.exit(result.status ?? 1);
