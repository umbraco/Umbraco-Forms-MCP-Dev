/**
 * Form Template Read Eval Test
 *
 * Verifies an LLM agent can use the "form-template" collection's single
 * read-only tool correctly against the real, live Umbraco instance (no
 * mocks exist for the Forms Management API). This instance has zero
 * seeded form templates, so an empty result is the expected, correct
 * outcome — the prompt is written to accept that gracefully rather than
 * assume templates exist.
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

describe("Form Template Read Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should list the available Umbraco Forms templates",
    runScenarioTest({
      prompt: `List the available Umbraco Forms templates. There may legitimately be zero templates on this instance — that is a valid, expected result, not an error. After listing, say "FORM TEMPLATE LIST RETRIEVED" followed by how many templates you found (this number may be 0).`,
      tools: ["list-form-templates"],
      requiredTools: ["list-form-templates"],
      successPattern: "FORM TEMPLATE LIST RETRIEVED",
      verbose: true,
    }),
    timeout
  );
});
