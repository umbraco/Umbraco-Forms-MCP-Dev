import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FolderBuilder,
  FolderTestHelper,
} from "./setup.js";
import updateFolderTool from "../put/update-folder.js";

const TEST_NAME = "_Test Update Folder";

describe("update-folder", () => {
  setupTestEnvironment();

  const createdIds: string[] = [];

  afterEach(async () => {
    for (const id of [...createdIds].reverse()) {
      await FolderTestHelper.deleteById(id);
    }
    createdIds.length = 0;
  });

  it("should update folder name", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FolderBuilder().withName(TEST_NAME).create();
    createdIds.push(builder.getId());

    const result = await updateFolderTool.handler(
      { id: builder.getId(), name: `${TEST_NAME} Updated` },
      context
    );

    expect(result.isError).toBeUndefined();

    const folder = await FolderTestHelper.findById(builder.getId());
    expect(folder?.name).toBe(`${TEST_NAME} Updated`);
  });

  it("should return error for non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await updateFolderTool.handler(
      { id: "00000000-0000-0000-0000-000000000000", name: "Invalid" },
      context
    );

    expect(result.isError).toBe(true);
  });
});
