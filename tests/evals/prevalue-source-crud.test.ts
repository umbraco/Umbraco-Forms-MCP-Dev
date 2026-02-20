import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const COLLECTION_TOOLS = [
  "list-prevalue-source-types",
  "create-prevalue-source",
  "list-prevalue-sources",
  "get-prevalue-source",
  "update-prevalue-source",
  "delete-prevalue-source",
] as const;

describe("prevalue-source CRUD eval tests", () => {
  setupConsoleMock();
  const timeout = getDefaultTimeoutMs();

  it(
    "should complete prevalue source CRUD lifecycle",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Generate a unique timestamp identifier (use current date/time in milliseconds)
2. List prevalue source types using list-prevalue-source-types and select the first available type ID
3. Create a new prevalue source with name "Test-PrevalueSource-{timestamp}" using the type ID from step 2
4. List all prevalue sources using list-prevalue-sources to find the one you just created
5. Get the specific prevalue source by its ID using get-prevalue-source
6. Update the prevalue source name to "Updated-PrevalueSource-{timestamp}" using update-prevalue-source
7. Delete the prevalue source using delete-prevalue-source
8. ONLY if every step above succeeded without errors, say "CRUD workflow completed successfully". If any step returned an error, say "CRUD workflow failed" and explain which steps failed.

Important:
- Use the timestamp from step 1 in both create and update steps
- Always search for the prevalue source by name after creating it to get its ID
- Never hardcode IDs`,
      tools: COLLECTION_TOOLS,
      requiredTools: [
        "list-prevalue-source-types",
        "create-prevalue-source",
        "list-prevalue-sources",
        "get-prevalue-source",
        "update-prevalue-source",
        "delete-prevalue-source",
      ],
      successPattern: "CRUD workflow completed successfully",
      verbose: true,
    }),
    timeout
  );
});
