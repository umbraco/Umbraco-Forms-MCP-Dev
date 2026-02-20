import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const COLLECTION_TOOLS = [
  "list-field-types",
  "get-field-type",
  "list-field-type-validation-patterns",
] as const;

describe("field-type read eval tests", () => {
  setupConsoleMock();
  const timeout = getDefaultTimeoutMs();

  it(
    "should complete read-only field type workflow",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. List all field types to see what form field types are available
2. Pick one field type from the list that has an ID
3. Get that specific field type by its ID to see full details
4. List all validation patterns available for field types
5. Report what you found (mention the field type name you looked up and how many validation patterns exist)
6. ONLY if every step above succeeded without errors, say "Read workflow completed successfully". If any step returned an error, say "Read workflow failed" and explain which steps failed.`,
      tools: COLLECTION_TOOLS,
      requiredTools: [
        "list-field-types",
        "get-field-type",
        "list-field-type-validation-patterns",
      ],
      successPattern: "Read workflow completed successfully",
      verbose: true,
    }),
    timeout
  );
});
