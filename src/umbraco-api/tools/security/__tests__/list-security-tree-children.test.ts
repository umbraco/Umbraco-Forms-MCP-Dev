import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  SecurityTestHelper,
} from "./setup.js";
import listSecurityTreeChildrenTool from "../get/list-security-tree-children.js";

// The connected instance has no security-tree folders with children (only a
// flat set of user/group entries), so there's no genuinely populated
// "children" node to query. The endpoint is also lenient — it doesn't
// validate that parentId corresponds to a real tree node, returning an empty
// page instead of erroring (verified directly against the live endpoint).
// Both tests below document that real, observed behavior.
describe("list-security-tree-children", () => {
  setupTestEnvironment();

  it("should return an empty page for a node with no children", async () => {
    const context = createMockRequestHandlerExtra();
    const currentUserId = await SecurityTestHelper.getCurrentUserId();

    const result = await listSecurityTreeChildrenTool.handler({ parentId: currentUserId }, context);

    expect(createSnapshotResult(result, currentUserId)).toMatchSnapshot();
  });

  it("should return an empty page for a parentId that doesn't exist in the tree", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listSecurityTreeChildrenTool.handler(
      { parentId: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
