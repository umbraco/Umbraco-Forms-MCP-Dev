/**
 * Config Read Eval Test
 *
 * Verifies an LLM agent can use the "config" collection's single read-only
 * tool correctly. Smoke test for the eval pipeline against the real,
 * live Umbraco instance (no mocks exist for the Forms Management API).
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

describe("Config Read Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should retrieve the Umbraco Forms back-office configuration",
    runScenarioTest({
      prompt: `Get the Umbraco Forms back-office configuration, then say "CONFIG RETRIEVED" followed by a brief summary of what settings you found (for example the security mode or layout limits).`,
      tools: ["get-forms-config"],
      requiredTools: ["get-forms-config"],
      successPattern: "CONFIG RETRIEVED",
      verbose: true,
    }),
    timeout
  );
});
