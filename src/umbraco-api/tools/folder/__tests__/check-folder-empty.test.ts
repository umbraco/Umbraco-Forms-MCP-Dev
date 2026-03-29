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

  beforeEach(async () => {
    await FolderTestHelper.cleanup(TEST_NAME);
  });

  afterEach(async () => {
    for (const id of [...createdIds].reverse()) {
      await FolderTestHelper.deleteById(id);
    }
    createdIds.length = 0;
    await FolderTestHelper.cleanup(TEST_NAME);
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
    expect(result.structuredContent).toEqual({ isEmpty: true });
  });
});
