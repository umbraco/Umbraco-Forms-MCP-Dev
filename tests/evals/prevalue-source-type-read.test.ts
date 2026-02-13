import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const COLLECTION_TOOLS = [
  "list-prevalue-source-types",
  "get-prevalue-source-type",
] as const;

describe("prevalue-source-type read eval tests", () => {
  setupConsoleMock();
  const timeout = getDefaultTimeoutMs();

  it(
    "should list and get prevalue source type details",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. List all prevalue source types to see what's available
2. Pick the first prevalue source type from the list
3. Get that specific prevalue source type by its ID to see full details
4. Report the type name and describe its settings schema (mention key fields if available)
5. Say "Read workflow completed successfully"`,
      tools: COLLECTION_TOOLS,
      requiredTools: ["list-prevalue-source-types", "get-prevalue-source-type"],
      successPattern: "Read workflow completed successfully",
      verbose: true,
    }),
    timeout
  );
});
