import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FolderTestHelper,
} from "./setup.js";
import createFolderTool from "../post/create-folder.js";

const TEST_NAME = "_Test Create Folder";

describe("create-folder", () => {
  setupTestEnvironment();

  const createdIds: string[] = [];

  afterEach(async () => {
    for (const id of [...createdIds].reverse()) {
      await FolderTestHelper.deleteById(id);
    }
    createdIds.length = 0;
  });

  it("should create a folder", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createFolderTool.handler(
      { name: TEST_NAME, parentId: undefined },
      context
    );

    expect(result.isError).toBeUndefined();
    const content = result.structuredContent as { id: string; name: string };
    expect(content.name).toBe(TEST_NAME);
    expect(content.id).toBeDefined();
    createdIds.push(content.id);
  });
});
