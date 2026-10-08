/**
 * Form Version History Eval Test
 *
 * Verifies an LLM agent can use a form's version history and audit log to
 * undo a change (Umbraco Forms 17.6 / 18.2 and later), against the real,
 * live Umbraco instance. Uses a timestamp in the name to avoid colliding with
 * any other test data, and leaves nothing behind.
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const VERSION_TOOLS = [
  "create-simple-form",
  "add-form-fields",
  "get-form-by-id",
  "list-form-versions",
  "get-form-version",
  "rollback-form-version",
  "get-form-audit-log",
  "delete-form",
  "delete-form-permanently",
] as const;

describe("Form Version History", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should roll a form back to an earlier version",
    runScenarioTest({
      prompt: `Complete these tasks in order, using the Umbraco Forms tools:
1. Generate a unique identifier using the current timestamp.
2. Create a simple form named "Eval Versions {timestamp}" with one text field labelled "Name".
3. Add an email field labelled "Email" to the form.
4. List the form's versions and find the oldest one (the version from before the Email field was added).
5. Roll the form back to that oldest version.
6. Get the form by its ID and confirm it no longer has the "Email" field.
7. Check the form's audit log and confirm it records the rollback.
8. Delete the form, then delete it permanently.
9. Say "VERSION ROLLBACK COMPLETE" once all steps succeed.`,
      tools: [...VERSION_TOOLS],
      requiredTools: [
        "create-simple-form",
        "add-form-fields",
        "list-form-versions",
        "rollback-form-version",
        "get-form-audit-log",
      ],
      successPattern: "VERSION ROLLBACK COMPLETE",
      verbose: true,
    }),
    timeout
  );
});
