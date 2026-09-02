/**
 * Analytics Read Eval Test
 *
 * Verifies an LLM agent can use the "analytics" collection's
 * query-analytics-overview tool correctly. All fields have sensible
 * defaults (per-form summary across all history), so the tool can be
 * called with no extra parameters. Smoke test for the eval pipeline
 * against the real, live Umbraco instance (no mocks exist for the Forms
 * Management API).
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

describe("Analytics Read Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should retrieve the Umbraco Forms analytics overview",
    runScenarioTest({
      prompt: `Get the Umbraco Forms analytics overview (a per-form summary of entries, workflow counts/errors, and storage/retention settings). You do not need to pass any extra parameters — the defaults give a sensible per-form summary across all history.

Then say "ANALYTICS OVERVIEW RETRIEVED" followed by a brief summary of what you found (for example how many columns and rows were returned, and whether there was any submission data — it's fine if there is none).`,
      tools: ["query-analytics-overview"],
      requiredTools: ["query-analytics-overview"],
      successPattern: "ANALYTICS OVERVIEW RETRIEVED",
      verbose: true,
    }),
    timeout
  );
});
