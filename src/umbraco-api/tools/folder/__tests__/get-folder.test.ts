import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FolderBuilder,
  FolderTestHelper,
} from "./setup.js";
import getFolderTool from "../get/get-folder.js";

const TEST_NAME = "_Test Get Folder";

describe("get-folder", () => {
  setupTestEnvironment();

  const createdIds: string[] = [];

  afterEach(async () => {
    for (const id of [...createdIds].reverse()) {
      await FolderTestHelper.deleteById(id);
    }
    createdIds.length = 0;
  });

  it("should return folder by ID", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FolderBuilder().withName(TEST_NAME).create();
    createdIds.push(builder.getId());

    const result = await getFolderTool.handler(
      { id: builder.getId() },
      context
    );

    expect(
      createSnapshotResult(result, builder.getId())
    ).toMatchSnapshot();
  });

  it("should return error for non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFolderTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context
    );

    expect(result.isError).toBe(true);
  });
});
