import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import validateFormWorkflowSettingsTool from "../post/validate-form-workflow-settings.js";

// The built-in "Send email" workflow type — a fixed system definition that
// always exists on any Umbraco Forms instance.
const TEST_SEND_EMAIL_WORKFLOW_TYPE_ID = "e96badd7-05be-4978-b8d9-b3d733de70a5";

describe("validate-form-workflow-settings", () => {
  setupTestEnvironment();

  it("should validate a workflow's settings against a real workflow type", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await validateFormWorkflowSettingsTool.handler(
      {
        id: TEST_SEND_EMAIL_WORKFLOW_TYPE_ID,
        name: "_Test Send Email Workflow",
        settings: {},
      },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should return an error for a non-existent workflow type id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await validateFormWorkflowSettingsTool.handler(
      {
        id: "00000000-0000-0000-0000-000000000000",
        name: "_Test Send Email Workflow",
        settings: {},
      },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
