import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  validateToolResponse,
  FolderBuilder,
} from "./setup.js";
import moveFolderTool from "../put/move-folder.js";
import getFolderByIdTool from "../get/get-folder-by-id.js";

const TEST_PARENT_NAME = "_Test Move Folder Parent";
const TEST_CHILD_NAME = "_Test Move Folder Child";

describe("move-folder", () => {
  setupTestEnvironment();

  let parentBuilder: FolderBuilder;
  let childBuilder: FolderBuilder;

  afterEach(async () => {
    if (childBuilder) await childBuilder.delete();
    if (parentBuilder) await parentBuilder.delete();
  });

  // Verifies the parentId -> { parentId } flattened body is actually sent —
  // a root-only test would pass even if this were broken, since the API
  // accepts parentId: null happily either way.
  it("should move a folder under a real parent folder", async () => {
    const context = createMockRequestHandlerExtra();
    parentBuilder = await new FolderBuilder().withName(TEST_PARENT_NAME).create();
    childBuilder = await new FolderBuilder().withName(TEST_CHILD_NAME).create();

    const result = await moveFolderTool.handler(
      { id: childBuilder.getId(), parentId: parentBuilder.getId() },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();

    const getResult = await getFolderByIdTool.handler({ id: childBuilder.getId() }, context);
    const data = validateToolResponse(getFolderByIdTool, getResult);
    expect(data.parentId).toBe(parentBuilder.getId());
  });

  it("should return an error for a non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await moveFolderTool.handler(
      { id: "00000000-0000-0000-0000-000000000000", parentId: undefined },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
