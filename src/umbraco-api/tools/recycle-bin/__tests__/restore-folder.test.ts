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
import restoreFolderTool from "../put/restore-folder.js";
import getFolderByIdTool from "../../folder/get/get-folder-by-id.js";
import getFormByIdTool from "../../form/get/get-form-by-id.js";

const TEST_FOLDER_NAME = "_Test Restore Folder";
const TEST_FORM_NAME = "_Test Restore Folder Form";

describe("restore-folder", () => {
  setupTestEnvironment();

  let folderId: string | undefined;

  afterEach(async () => {
    if (folderId) await purgeFolder(folderId);
    folderId = undefined;
  });

  it("should restore a trashed folder together with its contents", async () => {
    const context = createMockRequestHandlerExtra();
    folderId = await FormTestHelper.createFolder(TEST_FOLDER_NAME);
    const formId = (await new FormBuilder().withName(TEST_FORM_NAME).withFolderId(folderId).create()).getId();
    await trashFolder(folderId);

    const result = await restoreFolderTool.handler({ id: folderId }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
    const folder = await getFolderByIdTool.handler({ id: folderId }, context);
    expect(folder.structuredContent).toMatchObject({ trashed: false });
    const form = await getFormByIdTool.handler({ id: formId, applyDictionaryTranslations: undefined }, context);
    expect(form.structuredContent).toMatchObject({ trashed: false, folderId });
  });

  it("should return an error for an unknown id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await restoreFolderTool.handler({ id: UNKNOWN_ID }, context);

    expect(result.isError).toBe(true);
  });
});
