/**
 * Updates Read Eval Test
 *
 * Verifies an LLM agent can use the "updates" collection's single
 * read-only tool correctly against the real, live Umbraco instance
 * (no mocks exist for the Forms Management API).
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

describe("Updates Read Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should check for available Umbraco Forms version updates",
    runScenarioTest({
      prompt: `Check for available Umbraco Forms version updates, then say "UPDATE CHECK RETRIEVED" followed by the latest available version you found.`,
      tools: ["get-updates-version"],
      requiredTools: ["get-updates-version"],
      successPattern: "UPDATE CHECK RETRIEVED",
      verbose: true,
    }),
    timeout
  );
});
