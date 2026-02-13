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
  "get-form-definition",
  "submit-form-entry",
  "delete-form",
] as const;

describe("form-submission read eval tests", () => {
  setupConsoleMock();
  const timeout = getDefaultTimeoutMs();

  it(
    "should complete form submission workflow",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Create a new form with name "EvalTestForm-Submission" using create-form and save the returned ID
2. Use get-form with the form ID to see its full structure including fields and pages
3. Use get-form-definition with the form ID to get the public delivery API definition
4. Delete the form using delete-form with the ID from step 1 to clean up
5. Report the form name and describe the differences between get-form and get-form-definition
6. Say "Read workflow completed successfully"`,
      tools: COLLECTION_TOOLS,
      requiredTools: ["create-form", "get-form", "get-form-definition", "delete-form"],
      successPattern: "Read workflow completed successfully",
      verbose: true,
    }),
    timeout
  );
});
