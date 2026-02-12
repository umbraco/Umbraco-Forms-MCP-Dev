import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
} from "./setup.js";
import retryRecordWorkflowTool from "../post/retry-record-workflow.js";

describe("retry-record-workflow", () => {
  setupTestEnvironment();

  it("should return error for non-existent workflow ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await retryRecordWorkflowTool.handler(
      {
        formId: "00000000-0000-0000-0000-000000000000",
        recordId: "00000000-0000-0000-0000-000000000000",
        workflowId: "00000000-0000-0000-0000-000000000000",
      },
      context
    );

    expect(result.isError).toBe(true);
  });
});
