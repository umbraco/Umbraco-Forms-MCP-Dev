import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FolderTestHelper,
} from "./setup.js";
import createFolderTool from "../post/create-folder.js";
import moveFolderTool from "../put/move-folder.js";

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
    const suffix = Date.now();

    const parentResult = await createFolderTool.handler(
      { name: `_Test Move Folder Parent ${suffix}`, parentId: undefined },
      context
    );
    expect(parentResult.isError).toBeUndefined();
    const parentId = (parentResult.structuredContent as any).id;
    createdIds.push(parentId);

    const childResult = await createFolderTool.handler(
      { name: `_Test Move Folder Child ${suffix}`, parentId: undefined },
      context
    );
    expect(childResult.isError).toBeUndefined();
    const childId = (childResult.structuredContent as any).id;
    createdIds.push(childId);

    const result = await moveFolderTool.handler(
      { id: childId, parentId },
      context
    );

    expect(result.isError).toBeUndefined();
  });
});
