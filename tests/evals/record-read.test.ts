import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const COLLECTION_TOOLS = [
  "create-form",
  "list-forms",
  "list-records",
  "list-record-set-actions",
  "delete-form",
] as const;

describe("record read eval tests", () => {
  setupConsoleMock();
  const timeout = getDefaultTimeoutMs();

  it(
    "should read records and available actions for a form",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Create a new form with name "EvalTestForm-Records" using create-form and save the returned ID
2. Use list-forms to confirm the form appears in the list
3. Use list-records with the form ID from step 1 to see what submission records exist
4. Use list-record-set-actions with the same form ID to see what bulk actions are available
5. Delete the form using delete-form with the ID from step 1 to clean up
6. Report what you found:
   - Form name and ID
   - Number of records found
   - Available bulk actions (if any)
7. ONLY if every step above succeeded without errors, say "Read workflow completed successfully". If any step returned an error, say "Read workflow failed" and explain which steps failed.`,
      tools: COLLECTION_TOOLS,
      requiredTools: ["create-form", "list-forms", "list-records", "list-record-set-actions", "delete-form"],
      successPattern: "Read workflow completed successfully",
      verbose: true,
    }),
    timeout
  );
});
