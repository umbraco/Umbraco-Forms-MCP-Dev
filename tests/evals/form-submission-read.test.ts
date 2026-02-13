import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const COLLECTION_TOOLS = [
  "create-form",
  "list-forms",
  "get-form-definition",
  "delete-form",
] as const;

describe("form-submission read eval tests", () => {
  setupConsoleMock();
  const timeout = getDefaultTimeoutMs();

  it(
    "should complete read-only form submission workflow",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Create a new form with name "EvalTestForm-Submission" using create-form and save the returned ID
2. Use list-forms to confirm the form exists
3. Use get-form-definition with the form ID from step 1 to get the form's public definition including field aliases, types, and validation rules
4. Delete the form using delete-form with the ID from step 1 to clean up
5. Report the form name and describe its definition structure
6. Say "Read workflow completed successfully"`,
      tools: COLLECTION_TOOLS,
      requiredTools: ["create-form", "list-forms", "get-form-definition", "delete-form"],
      successPattern: "Read workflow completed successfully",
      verbose: true,
    }),
    timeout
  );
});
