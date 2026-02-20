import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const COLLECTION_TOOLS = [
  "list-data-source-types",
  "get-data-source-type",
] as const;

describe("data-source-type read eval tests", () => {
  setupConsoleMock();
  const timeout = getDefaultTimeoutMs();

  it(
    "should complete read-only workflow for data source types",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. List all data source types to see what's available
2. Pick the first data source type from the list
3. Get that specific data source type by its ID to see full details
4. Report the data source type name and describe its settings schema (what properties it has)
5. ONLY if every step above succeeded without errors, say "Read workflow completed successfully". If any step returned an error, say "Read workflow failed" and explain which steps failed.`,
      tools: COLLECTION_TOOLS,
      requiredTools: ["list-data-source-types", "get-data-source-type"],
      successPattern: "Read workflow completed successfully",
      verbose: true,
    }),
    timeout
  );
});
