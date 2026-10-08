import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FormBuilder,
  FormTestHelper,
  purgeFolder,
  trashFolder,
  UNKNOWN_ID,
} from "./setup.js";
import deleteFolderPermanentlyTool from "../delete/delete-folder-permanently.js";
import getFolderByIdTool from "../../folder/get/get-folder-by-id.js";
import getFormByIdTool from "../../form/get/get-form-by-id.js";

const TEST_FOLDER_NAME = "_Test Delete Folder Permanently";
const TEST_FORM_NAME = "_Test Delete Folder Permanently Form";

describe("delete-folder-permanently", () => {
  setupTestEnvironment();

  let folderId: string | undefined;

  afterEach(async () => {
    if (folderId) await purgeFolder(folderId);
    folderId = undefined;
  });

  it("should permanently delete a trashed folder and the forms inside it", async () => {
    const context = createMockRequestHandlerExtra();
    folderId = await FormTestHelper.createFolder(TEST_FOLDER_NAME);
    const formId = (await new FormBuilder().withName(TEST_FORM_NAME).withFolderId(folderId).create()).getId();
    await trashFolder(folderId);

    const result = await deleteFolderPermanentlyTool.handler({ id: folderId }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
    expect((await getFolderByIdTool.handler({ id: folderId }, context)).isError).toBe(true);
    expect((await getFormByIdTool.handler({ id: formId, applyDictionaryTranslations: undefined }, context)).isError).toBe(true);
  });

  it("should refuse a folder that is not in the recycle bin", async () => {
    const context = createMockRequestHandlerExtra();
    folderId = await FormTestHelper.createFolder(TEST_FOLDER_NAME);

    const result = await deleteFolderPermanentlyTool.handler({ id: folderId }, context);

    expect(result.isError).toBe(true);
  });

  it("should return an error for an unknown id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteFolderPermanentlyTool.handler({ id: UNKNOWN_ID }, context);

    expect(result.isError).toBe(true);
  });
});
