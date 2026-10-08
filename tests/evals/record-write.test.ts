/**
 * Record Write Eval Test
 *
 * Verifies an LLM agent can add an entry to a form through the Management
 * API with create-record (Umbraco Forms 17.6 / 18.2 and later), using field
 * IDs from the form's design, against the real, live Umbraco instance. Uses
 * a timestamp in the name to avoid colliding with any other test data, and
 * leaves nothing behind. delete-record isn't exercised: it needs the "delete
 * entries" Forms permission, which the test API user doesn't have by default.
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const RECORD_WRITE_TOOLS = [
  "create-simple-form",
  "get-form-by-id",
  "create-record",
  "search-records",
  "delete-form",
  "delete-form-permanently",
] as const;

describe("Record Write Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should add an entry to a form and find it",
    runScenarioTest({
      prompt: `Complete these tasks in order, using the Umbraco Forms tools:
1. Generate a unique identifier using the current timestamp.
2. Create a simple form named "Eval Records {timestamp}" with one text field labelled "Name".
3. Get the form by its ID to find the ID of the "Name" field.
4. Add an entry to the form with "Ada Lovelace" as the value of the "Name" field.
5. Search the form's records and confirm there is exactly one entry.
6. Delete the form, then delete it permanently.
7. Say "RECORD WRITE COMPLETE" once all steps succeed.`,
      tools: [...RECORD_WRITE_TOOLS],
      requiredTools: ["create-simple-form", "get-form-by-id", "create-record", "search-records"],
      successPattern: "RECORD WRITE COMPLETE",
      verbose: true,
    }),
    timeout
  );
});
