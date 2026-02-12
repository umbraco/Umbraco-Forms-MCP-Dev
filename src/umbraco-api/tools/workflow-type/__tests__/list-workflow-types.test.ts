import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  WorkflowTypeTestHelper,
} from "./setup.js";
import listWorkflowTypesTool from "../get/list-workflow-types.js";

describe("list-workflow-types", () => {
  setupTestEnvironment();

  it("should return all available workflow types", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listWorkflowTypesTool.handler({}, context);

    expect(
      WorkflowTypeTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });
});
