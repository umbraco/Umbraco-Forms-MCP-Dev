import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  validateToolResponse,
  FormTestHelper,
  purgeFolder,
  trashFolder,
  UNKNOWN_ID,
} from "./setup.js";
import getFolderRestoreDestinationTool from "../get/get-folder-restore-destination.js";

const TEST_PARENT_NAME = "_Test Folder Restore Destination Parent";
const TEST_CHILD_NAME = "_Test Folder Restore Destination Child";

describe("get-folder-restore-destination", () => {
  setupTestEnvironment();

  let parentId: string | undefined;

  afterEach(async () => {
    if (parentId) await purgeFolder(parentId);
    parentId = undefined;
  });

  it("should name the folder a trashed folder was deleted from", async () => {
    const context = createMockRequestHandlerExtra();
    parentId = await FormTestHelper.createFolder(TEST_PARENT_NAME);
    const childId = await FormTestHelper.createFolder(TEST_CHILD_NAME, parentId);
    await trashFolder(childId);

    const result = await getFolderRestoreDestinationTool.handler({ id: childId }, context);

    const data = validateToolResponse(getFolderRestoreDestinationTool, result);
    expect(data.destinationId).toBe(parentId);
    expect(createSnapshotResult({ ...result, structuredContent: { ...data, destinationId: "PARENT_ID" } })).toMatchSnapshot();
  });

  it("should return an error for an unknown id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFolderRestoreDestinationTool.handler({ id: UNKNOWN_ID }, context);

    expect(result.isError).toBe(true);
  });
});
