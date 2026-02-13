import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const COLLECTION_TOOLS = [
  "create-form",
  "update-form",
  "list-forms",
  "get-form",
  "get-form-tree",
  "delete-form",
] as const;

describe("form read eval tests", () => {
  setupConsoleMock();
  const timeout = getDefaultTimeoutMs();

  it(
    "should complete form read and update workflow",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Create a new form with name "EvalTestForm-ReadWorkflow" using create-form and save the returned ID
2. List all forms to confirm the form exists
3. Get the form by its ID to see full details (name, fields, settings)
4. Update the form: change the name to "EvalTestForm-Updated" and set the submitLabel to "Send"
5. Get the form again to verify the updates were applied
6. Browse the form tree to see the folder hierarchy
7. Delete the form using delete-form to clean up
8. Report what you found: confirm the name was updated and describe the tree structure
9. Say "Read workflow completed successfully"`,
      tools: COLLECTION_TOOLS,
      requiredTools: ["create-form", "update-form", "get-form", "get-form-tree", "delete-form"],
      successPattern: "Read workflow completed successfully",
      verbose: true,
    }),
    timeout
  );
});
