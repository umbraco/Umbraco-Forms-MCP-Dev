/**
 * Data Source Type Read Eval Test
 *
 * Verifies an LLM agent can chain the "data-source-type" collection's two
 * read-only tools: list the fixed, system-defined data source types, then
 * fetch the full settings-schema details for one of them by its real id.
 * Data source types are not user-created content (defined by Umbraco Forms
 * core and installed packages), so this is a read-only smoke test against
 * the real, live Umbraco instance (no mocks exist for the Forms Management
 * API).
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const DATA_SOURCE_TYPE_TOOLS = [
  "list-data-source-types",
  "get-data-source-type-by-id",
] as const;

describe("Data Source Type Read Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should list data source types then get details for one by its id",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. List all Umbraco Forms data source types.
2. From that list, pick the first data source type and note its real "id" field. Never invent or guess an id — use only the exact id value returned by the list call.
3. Get the full details for that data source type by its id.
4. Say "DATA SOURCE TYPE DETAILS RETRIEVED" followed by the alias and name of the data source type you looked up.`,
      tools: [...DATA_SOURCE_TYPE_TOOLS],
      requiredTools: [...DATA_SOURCE_TYPE_TOOLS],
      successPattern: "DATA SOURCE TYPE DETAILS RETRIEVED",
      verbose: true,
    }),
    timeout
  );
});
