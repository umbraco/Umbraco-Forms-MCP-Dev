import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FolderBuilder,
} from "./setup.js";
import updateFolderTool from "../put/update-folder.js";

const TEST_NAME = "_Test Update Folder";
const TEST_NAME_RENAMED = "_Test Update Folder Renamed";

describe("update-folder", () => {
  setupTestEnvironment();

  let builder: FolderBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should rename an existing folder", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FolderBuilder().withName(TEST_NAME).create();

    const result = await updateFolderTool.handler(
      { id: builder.getId(), name: TEST_NAME_RENAMED },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should return an error for a non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await updateFolderTool.handler(
      { id: "00000000-0000-0000-0000-000000000000", name: TEST_NAME_RENAMED },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
