/**
 * Folder CRUD Eval Test
 *
 * Verifies an LLM agent can complete a full create-read-update-delete
 * lifecycle using the "folder" collection's tools, against the real,
 * live Umbraco instance (no mocks exist for the Forms Management API).
 * Uses a timestamp in the name to avoid colliding with any other test data.
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const FOLDER_TOOLS = [
  "create-folder",
  "get-folder-by-id",
  "is-folder-empty",
  "update-folder",
  "delete-folder",
] as const;

describe("Folder CRUD Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should complete a full create-read-update-delete folder workflow",
    runScenarioTest({
      prompt: `Complete these tasks in order, using the Umbraco Forms folder tools:
1. Generate a unique identifier using the current timestamp.
2. Create a new folder named "Eval Test Folder {timestamp}" at the root (no parent folder).
3. Check that the folder you just created is empty.
4. Get the folder by its ID to confirm its name matches what you created.
5. Rename the folder to "Eval Test Folder {timestamp} Renamed".
6. Delete the folder you created.
7. Say "FOLDER CRUD WORKFLOW COMPLETE" once all steps succeed.`,
      tools: [...FOLDER_TOOLS],
      requiredTools: [
        "create-folder",
        "get-folder-by-id",
        "update-folder",
        "delete-folder",
      ],
      successPattern: "FOLDER CRUD WORKFLOW COMPLETE",
      verbose: true,
    }),
    timeout
  );
});
