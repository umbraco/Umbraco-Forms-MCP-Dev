/**
 * Theme Read Eval Test
 *
 * Verifies an LLM agent can use the "theme" collection's single read-only
 * tool correctly. Smoke test for the eval pipeline against the real,
 * live Umbraco instance (no mocks exist for the Forms Management API).
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

describe("Theme Read Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should list the available Umbraco Forms themes",
    runScenarioTest({
      prompt: `List the available Umbraco Forms themes, then say "THEME LIST RETRIEVED" followed by how many themes you found.`,
      tools: ["list-themes"],
      requiredTools: ["list-themes"],
      successPattern: "THEME LIST RETRIEVED",
      verbose: true,
    }),
    timeout
  );
});
