import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FolderBuilder,
  FolderTestHelper,
} from "./setup.js";
import moveFolderTool from "../put/move-folder.js";

const TEST_NAME = "_Test Move Folder";

describe("move-folder", () => {
  setupTestEnvironment();

  const createdIds: string[] = [];

  afterEach(async () => {
    // Delete children first, then parents
    for (const id of [...createdIds].reverse()) {
      await FolderTestHelper.deleteById(id);
    }
    createdIds.length = 0;
  });

  it("should move folder to a new parent", async () => {
    const context = createMockRequestHandlerExtra();
    const parent = await new FolderBuilder().withName(`${TEST_NAME} Parent`).create();
    createdIds.push(parent.getId());
    const child = await new FolderBuilder().withName(`${TEST_NAME} Child`).create();
    createdIds.push(child.getId());

    const result = await moveFolderTool.handler(
      { id: child.getId(), parentId: parent.getId() },
      context
    );

    expect(result.isError).toBeUndefined();

    const moved = await FolderTestHelper.findById(child.getId());
    expect(moved?.parentId).toBe(parent.getId());
  });
});
