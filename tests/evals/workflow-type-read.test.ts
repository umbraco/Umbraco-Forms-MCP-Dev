import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const COLLECTION_TOOLS = [
  "list-workflow-types",
  "get-workflow-type",
] as const;

describe("workflow-type read eval tests", () => {
  setupConsoleMock();
  const timeout = getDefaultTimeoutMs();

  it(
    "should list and get workflow type details",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. List all workflow types to see what's available
2. Pick the first workflow type from the list
3. Get that specific workflow type by its ID to see full details
4. Report the workflow type name and its settings schema
5. Say "Read workflow completed successfully"`,
      tools: COLLECTION_TOOLS,
      requiredTools: ["list-workflow-types", "get-workflow-type"],
      successPattern: "Read workflow completed successfully",
      verbose: true,
    }),
    timeout
  );
});
