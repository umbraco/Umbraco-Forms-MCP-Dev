/**
 * Licensing Read Eval Test
 *
 * Verifies an LLM agent can use the "licensing" collection's single read-only
 * tool correctly. Smoke test for the eval pipeline against the real,
 * live Umbraco instance (no mocks exist for the Forms Management API).
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

describe("Licensing Read Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should retrieve the Umbraco Forms licensing status",
    runScenarioTest({
      prompt: `Get the current Umbraco Forms licensing status, then say "LICENSING STATUS RETRIEVED" followed by a brief summary of what you found (for example whether it is a trial and whether the license is valid).`,
      tools: ["get-licensing-status"],
      requiredTools: ["get-licensing-status"],
      successPattern: "LICENSING STATUS RETRIEVED",
      verbose: true,
    }),
    timeout
  );
});
