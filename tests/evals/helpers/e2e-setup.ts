import path from "path";
import { fileURLToPath } from "url";
import { configureEvals } from "@umbraco-cms/mcp-server-sdk/evals";
import { beforeAll, afterEach, afterAll } from "@jest/globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../../");

configureEvals({
  mcpServerPath: path.resolve(projectRoot, "dist/index.js"),
  mcpServerName: "my-commerce-mcp",
  serverEnv: {
    UMBRACO_CLIENT_ID: process.env.UMBRACO_CLIENT_ID || "",
    UMBRACO_CLIENT_SECRET: process.env.UMBRACO_CLIENT_SECRET || "",
    UMBRACO_BASE_URL: process.env.UMBRACO_BASE_URL || "",
    NODE_TLS_REJECT_UNAUTHORIZED: "0",
    DISABLE_MCP_CHAINING: "true",
  },
  defaultModel: "claude-haiku-4-5-20251001",
  defaultMaxTurns: 10,
  defaultMaxBudgetUsd: 0.25,
  defaultTimeoutMs: 60000,
});

// Test result tracking
const testResults: { name: string; status: string; duration: number }[] = [];
let suiteStartTime: number;

beforeAll(() => {
  suiteStartTime = Date.now();
});

afterEach(() => {
  const currentTest = expect.getState();
  testResults.push({
    name: currentTest.currentTestName || "unknown",
    status: currentTest.numPassingAsserts > 0 ? "passed" : "failed",
    duration: Date.now() - suiteStartTime,
  });
});

afterAll(() => {
  const totalDuration = Date.now() - suiteStartTime;
  const passed = testResults.filter((r) => r.status === "passed").length;
  const failed = testResults.filter((r) => r.status === "failed").length;

  console.log("\n=== Eval Test Summary ===");
  console.log(`Total: ${testResults.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`Duration: ${(totalDuration / 1000).toFixed(1)}s`);

  for (const result of testResults) {
    const icon = result.status === "passed" ? "PASS" : "FAIL";
    console.log(`  [${icon}] ${result.name}`);
  }

  console.log("========================\n");
});
