import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getWorkflowTypeByIdTool from "../get/get-workflow-type-by-id.js";

// The "Send email" built-in workflow type — a fixed system definition that always exists.
const TEST_SEND_EMAIL_WORKFLOW_TYPE_ID = "e96badd7-05be-4978-b8d9-b3d733de70a5";
const TEST_NONEXISTENT_ID = "00000000-0000-0000-0000-000000000000";

describe("get-workflow-type-by-id", () => {
  setupTestEnvironment();

  it("should return the workflow type by id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getWorkflowTypeByIdTool.handler(
      { id: TEST_SEND_EMAIL_WORKFLOW_TYPE_ID },
      context,
    );

    expect(
      createSnapshotResult(result, TEST_SEND_EMAIL_WORKFLOW_TYPE_ID),
    ).toMatchSnapshot();
  });

  it("should return an error for a non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getWorkflowTypeByIdTool.handler(
      { id: TEST_NONEXISTENT_ID },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
