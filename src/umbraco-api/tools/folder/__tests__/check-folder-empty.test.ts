import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FolderBuilder,
  FolderTestHelper,
} from "./setup.js";
import checkFolderEmptyTool from "../get/check-folder-empty.js";

const TEST_NAME = "_Test Check Folder Empty";

describe("check-folder-empty", () => {
  setupTestEnvironment();

  const createdIds: string[] = [];

  afterEach(async () => {
    for (const id of [...createdIds].reverse()) {
      await FolderTestHelper.deleteById(id);
    }
    createdIds.length = 0;
  });

  it("should return true for empty folder", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FolderBuilder().withName(TEST_NAME).create();
    createdIds.push(builder.getId());

    const result = await checkFolderEmptyTool.handler(
      { id: builder.getId() },
      context
    );

    expect(result.isError).toBeUndefined();
    expect(result.structuredContent).toBe(true);
  });
});
