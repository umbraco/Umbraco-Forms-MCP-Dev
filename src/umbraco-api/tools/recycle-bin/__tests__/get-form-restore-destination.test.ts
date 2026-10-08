import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  validateToolResponse,
  FormBuilder,
  FormTestHelper,
  purgeForm,
  purgeFolder,
  trashForm,
  trashFolder,
  UNKNOWN_ID,
} from "./setup.js";
import getFormRestoreDestinationTool from "../get/get-form-restore-destination.js";

const TEST_FOLDER_NAME = "_Test Form Restore Destination Folder";
const TEST_FORM_NAME = "_Test Form Restore Destination";

describe("get-form-restore-destination", () => {
  setupTestEnvironment();

  let folderId: string | undefined;
  let formId: string | undefined;

  afterEach(async () => {
    if (formId) await purgeForm(formId);
    if (folderId) await purgeFolder(folderId);
    formId = folderId = undefined;
  });

  it("should name the folder a trashed form was deleted from", async () => {
    const context = createMockRequestHandlerExtra();
    folderId = await FormTestHelper.createFolder(TEST_FOLDER_NAME);
    formId = (await new FormBuilder().withName(TEST_FORM_NAME).withFolderId(folderId).create()).getId();
    await trashForm(formId);

    const result = await getFormRestoreDestinationTool.handler({ id: formId }, context);

    const data = validateToolResponse(getFormRestoreDestinationTool, result);
    expect(data.destinationId).toBe(folderId);
    expect(createSnapshotResult({ ...result, structuredContent: { ...data, destinationId: "FOLDER_ID" } })).toMatchSnapshot();
  });

  it("should fall back to the root when the form's folder is trashed too", async () => {
    const context = createMockRequestHandlerExtra();
    folderId = await FormTestHelper.createFolder(TEST_FOLDER_NAME);
    formId = (await new FormBuilder().withName(TEST_FORM_NAME).withFolderId(folderId).create()).getId();
    await trashFolder(folderId);

    const result = await getFormRestoreDestinationTool.handler({ id: formId }, context);

    expect(validateToolResponse(getFormRestoreDestinationTool, result).destinationId).toBeNull();
  });

  it("should return an error for an unknown id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFormRestoreDestinationTool.handler({ id: UNKNOWN_ID }, context);

    expect(result.isError).toBe(true);
  });
});
