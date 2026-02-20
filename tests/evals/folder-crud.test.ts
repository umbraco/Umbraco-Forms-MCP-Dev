import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const COLLECTION_TOOLS = [
  "create-folder",
  "get-folder",
  "check-folder-empty",
  "update-folder",
  "move-folder",
  "delete-folder",
] as const;

describe("folder CRUD eval tests", () => {
  setupConsoleMock();
  const timeout = getDefaultTimeoutMs();

  it(
    "should complete full CRUD lifecycle for folder",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Generate a unique timestamp identifier (e.g., current time in milliseconds).
2. Create a new folder with name "Eval Test Folder {timestamp}". The create operation will return a folder object with an id property - save this ID for the following steps.
3. Get the folder you just created using get-folder with the ID from step 2 to verify it was created successfully.
4. Check if the folder is empty using check-folder-empty with the same ID. It should be empty since it's a newly created folder.
5. Update the folder's name to "Updated Eval Folder {timestamp}" using update-folder with the same ID.
6. Delete the folder using delete-folder with the same ID.
7. ONLY if every step above succeeded without errors, say "CRUD workflow completed successfully". If any step returned an error, say "CRUD workflow failed" and explain which steps failed.

Important: Never hardcode IDs. Always use the ID returned from the create operation in step 2 for all subsequent operations.`,
      tools: COLLECTION_TOOLS,
      requiredTools: [
        "create-folder",
        "get-folder",
        "check-folder-empty",
        "update-folder",
        "delete-folder",
      ],
      successPattern: "CRUD workflow completed successfully",
      verbose: true,
    }),
    timeout
  );
});
