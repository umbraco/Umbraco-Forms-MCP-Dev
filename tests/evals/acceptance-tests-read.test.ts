/**
 * Acceptance Tests Read Eval Test
 *
 * Verifies an LLM agent can use the "acceptance-tests" collection's single
 * read-only tool correctly. This tool takes no parameters and returns host
 * system information (OS and database platform) for the connected Umbraco
 * Forms instance. Runs against the real, live Umbraco instance (no mocks
 * exist for the Forms Management API).
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

describe("Acceptance Tests Read Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should retrieve host system info for the connected Umbraco Forms instance",
    runScenarioTest({
      prompt: `Get the host system information for the connected Umbraco Forms instance (operating system and database platform). This tool takes no parameters. Then say "SYSTEM INFO RETRIEVED" followed by a one-line summary of the operating system and database platform you found.`,
      tools: ["get-acceptance-tests-system-info"],
      requiredTools: ["get-acceptance-tests-system-info"],
      successPattern: "SYSTEM INFO RETRIEVED",
      verbose: true,
    }),
    timeout
  );
});
