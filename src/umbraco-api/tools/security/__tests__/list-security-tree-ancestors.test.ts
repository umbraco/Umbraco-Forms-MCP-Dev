import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  SecurityTestHelper,
} from "./setup.js";
import listSecurityTreeAncestorsTool from "../get/list-security-tree-ancestors.js";

describe("list-security-tree-ancestors", () => {
  setupTestEnvironment();

  it("should list the ancestor path for a real node in the tree", async () => {
    const context = createMockRequestHandlerExtra();
    const currentUserId = await SecurityTestHelper.getCurrentUserId();

    const result = await listSecurityTreeAncestorsTool.handler(
      { descendantId: currentUserId },
      context,
    );

    expect(createSnapshotResult(result, currentUserId)).toMatchSnapshot();
  });

  it("should list root-level ancestors when descendantId is omitted", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listSecurityTreeAncestorsTool.handler({ descendantId: undefined }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
