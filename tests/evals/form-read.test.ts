import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const COLLECTION_TOOLS = [
  "create-form",
  "list-forms",
  "get-form",
  "get-form-tree",
  "delete-form",
] as const;

describe("form read eval tests", () => {
  setupConsoleMock();
  const timeout = getDefaultTimeoutMs();

  it(
    "should complete read-only form workflow",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Create a new form with name "EvalTestForm-ReadWorkflow" using create-form
2. List all forms to see what forms exist in the system
3. Get the form you just created by its ID to see full details (name, fields, settings)
4. Browse the form tree to see the folder hierarchy and structure
5. Delete the form you created using delete-form to clean up
6. Report what you found: mention the form name you looked up and describe the tree structure
7. Say "Read workflow completed successfully"`,
      tools: COLLECTION_TOOLS,
      requiredTools: ["create-form", "list-forms", "get-form", "get-form-tree", "delete-form"],
      successPattern: "Read workflow completed successfully",
      verbose: true,
    }),
    timeout
  );
});
