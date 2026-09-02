import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FolderBuilder,
} from "./setup.js";
import getFolderByIdTool from "../get/get-folder-by-id.js";

const TEST_NAME = "_Test Get Folder By Id";

describe("get-folder-by-id", () => {
  setupTestEnvironment();

  let builder: FolderBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should return a folder by ID", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FolderBuilder().withName(TEST_NAME).create();

    const result = await getFolderByIdTool.handler({ id: builder.getId() }, context);

    expect(createSnapshotResult(result, builder.getId())).toMatchSnapshot();
  });

  it("should return an error for a non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFolderByIdTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
