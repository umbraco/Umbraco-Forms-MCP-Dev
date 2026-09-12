#!/usr/bin/env node
/**
 * Re-runs only the tests that failed in the previous `npm test` run, as
 * recorded by jest-failure-reporter.ts in test-failures.log.
 *
 * Exits with jest's real exit code when a rerun happens, so a still-failing
 * test is never masked by a "no failures" message — the two outcomes are
 * distinguished by checking the log's contents up front, not by inspecting
 * the exit code of a piped command.
 *
 * Usage:
 *   npm run test:rerun-failures
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const REPO_ROOT = new URL("..", import.meta.url).pathname;
const LOG_FILE = "test-failures.log";

function getFailedTestFiles() {
  if (!existsSync(LOG_FILE)) {
    return [];
  }

  return readFileSync(LOG_FILE, "utf8")
    .split("\n")
    .filter((line) => line.startsWith("FAIL "))
    .map((line) => line.slice("FAIL ".length).trim())
    .filter(Boolean);
}

function main() {
  const testFiles = getFailedTestFiles();

  if (testFiles.length === 0) {
    console.log("No failures to rerun (test-failures.log not found or empty)");
    process.exit(0);
  }

  console.log(`Re-running ${testFiles.length} previously failed test file(s)...`);

  try {
    execFileSync(
      "node",
      [
        "--experimental-vm-modules",
        "node_modules/jest/bin/jest.js",
        "--runInBand",
        "--forceExit",
        ...testFiles,
      ],
      { cwd: REPO_ROOT, stdio: "inherit" }
    );
  } catch (err) {
    process.exit(err.status ?? 1);
  }
}

main();
