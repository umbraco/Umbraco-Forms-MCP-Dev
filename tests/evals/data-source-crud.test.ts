import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const COLLECTION_TOOLS = [
  "list-data-source-types",
  "create-data-source",
  "list-data-sources",
  "get-data-source",
  "update-data-source",
  "delete-data-source",
] as const;

describe("data-source CRUD eval tests", () => {
  setupConsoleMock();
  const timeout = getDefaultTimeoutMs();

  it(
    "should complete full CRUD lifecycle for data source",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. First, list all data source types using list-data-source-types to find a valid type ID. Pick the first type from the results.
2. Generate a unique timestamp identifier (e.g., current time in milliseconds).
3. Create a new data source with name "TestDataSource-{timestamp}" using the type ID from step 1. Save the ID returned from the creation.
4. List all data sources using list-data-sources to confirm the one you created appears in the list.
5. Get the specific data source you created by its ID using get-data-source.
6. Update the data source name to "UpdatedDataSource-{timestamp}" using update-data-source with the same ID.
7. Delete the data source you created using delete-data-source with the ID.
8. Say "CRUD workflow completed successfully"

Important: Never hardcode IDs. Always use the ID returned from the create operation.`,
      tools: COLLECTION_TOOLS,
      requiredTools: [
        "list-data-source-types",
        "create-data-source",
        "list-data-sources",
        "get-data-source",
        "update-data-source",
        "delete-data-source",
      ],
      successPattern: "CRUD workflow completed successfully",
      verbose: true,
    }),
    timeout
  );
});
