/**
 * Prevalue Source Type Read Eval Test
 *
 * Verifies an LLM agent can chain the "prevalue-source-type" collection's two
 * read-only tools: list the fixed, system-defined prevalue source types, then
 * fetch the full settings-schema details for one of them by its real id.
 * Prevalue source types are not user-created content (fixed system definitions
 * built into Umbraco Forms), so this is a read-only smoke test against the
 * real, live Umbraco instance (no mocks exist for the Forms Management API).
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const PREVALUE_SOURCE_TYPE_TOOLS = [
  "list-prevalue-source-types",
  "get-prevalue-source-type-by-id",
] as const;

describe("Prevalue Source Type Read Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should list prevalue source types then get details for one by its id",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. List all Umbraco Forms prevalue source types.
2. From that list, pick the first prevalue source type and note its real "id" field. Never invent or guess an id — use only the exact id value returned by the list call.
3. Get the full details for that prevalue source type by its id.
4. Say "PREVALUE SOURCE TYPE DETAILS RETRIEVED" followed by the alias and name of the prevalue source type you looked up.`,
      tools: [...PREVALUE_SOURCE_TYPE_TOOLS],
      requiredTools: [...PREVALUE_SOURCE_TYPE_TOOLS],
      successPattern: "PREVALUE SOURCE TYPE DETAILS RETRIEVED",
      verbose: true,
    }),
    timeout
  );
});
