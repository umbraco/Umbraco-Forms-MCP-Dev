import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  WorkflowTypeTestHelper,
} from "./setup.js";
import getWorkflowTypeTool from "../get/get-workflow-type.js";

describe("get-workflow-type", () => {
  setupTestEnvironment();

  it("should return workflow type by ID", async () => {
    const context = createMockRequestHandlerExtra();
    const firstType = await WorkflowTypeTestHelper.getFirst();

    const result = await getWorkflowTypeTool.handler(
      { id: firstType.id },
      context
    );

    expect(
      createSnapshotResult(result, firstType.id)
    ).toMatchSnapshot();
  });

  it("should return error for non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getWorkflowTypeTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context
    );

    expect(result.isError).toBe(true);
  });
});
