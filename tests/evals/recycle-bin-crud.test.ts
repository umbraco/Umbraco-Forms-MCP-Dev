/**
 * Recycle Bin Eval Test
 *
 * Verifies an LLM agent can move a form to the recycle bin, find it there,
 * restore it, and then delete it for good, using the "recycle-bin"
 * collection (Umbraco Forms 17.6 / 18.2 and later) against the real, live
 * Umbraco instance. Uses a timestamp in the name to avoid colliding with any
 * other test data, and leaves nothing behind.
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const RECYCLE_BIN_TOOLS = [
  "create-simple-form",
  "get-form-by-id",
  "delete-form",
  "get-recycle-bin-root",
  "get-form-restore-destination",
  "restore-form",
  "delete-form-permanently",
] as const;

describe("Recycle Bin Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should trash, find, restore and permanently delete a form",
    runScenarioTest({
      prompt: `Complete these tasks in order, using the Umbraco Forms tools:
1. Generate a unique identifier using the current timestamp.
2. Create a simple form named "Eval Recycle Bin {timestamp}" with one text field labelled "Name".
3. Delete the form (this moves it to the recycle bin).
4. List the recycle bin and confirm the form is in it.
5. Check where the form would be restored to.
6. Restore the form, then get it by its ID to confirm it is no longer trashed.
7. Delete the form again, then delete it permanently.
8. Say "RECYCLE BIN WORKFLOW COMPLETE" once all steps succeed.`,
      tools: [...RECYCLE_BIN_TOOLS],
      requiredTools: [
        "create-simple-form",
        "delete-form",
        "get-recycle-bin-root",
        "restore-form",
        "delete-form-permanently",
      ],
      successPattern: "RECYCLE BIN WORKFLOW COMPLETE",
      verbose: true,
    }),
    timeout
  );
});
