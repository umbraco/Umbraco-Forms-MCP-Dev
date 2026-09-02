import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import listSecurityTreeRootTool from "../get/list-security-tree-root.js";

describe("list-security-tree-root", () => {
  setupTestEnvironment();

  it("should list the top-level nodes of the Forms security tree", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listSecurityTreeRootTool.handler({}, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
