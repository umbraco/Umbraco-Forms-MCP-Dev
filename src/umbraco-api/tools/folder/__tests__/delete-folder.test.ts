import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FolderTestHelper,
} from "./setup.js";
import createFolderTool from "../post/create-folder.js";
import deleteFolderTool from "../delete/delete-folder.js";

describe("delete-folder", () => {
  setupTestEnvironment();

  const createdIds: string[] = [];

  afterEach(async () => {
    for (const id of [...createdIds].reverse()) {
      await FolderTestHelper.deleteById(id);
    }
    createdIds.length = 0;
  });

  it("should delete a folder", async () => {
    const context = createMockRequestHandlerExtra();
    const uniqueName = `_Test Delete Folder ${Date.now()}`;

    const createResult = await createFolderTool.handler(
      { name: uniqueName, parentId: undefined },
      context
    );
    expect(createResult.isError).toBeUndefined();
    const id = (createResult.structuredContent as any).id;
    createdIds.push(id);

    const result = await deleteFolderTool.handler({ id }, context);

    expect(result.isError).toBeUndefined();
  });

  it("should return error for non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteFolderTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context
    );

    expect(result.isError).toBe(true);
  });
});
