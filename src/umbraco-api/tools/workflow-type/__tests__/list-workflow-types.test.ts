import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import listWorkflowTypesTool from "../get/list-workflow-types.js";

describe("list-workflow-types", () => {
  setupTestEnvironment();

  it("should list registered workflow types", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listWorkflowTypesTool.handler({}, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
