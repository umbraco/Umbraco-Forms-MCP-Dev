import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FormBuilder,
  FormTestHelper,
  purgeForm,
  purgeFolder,
  trashForm,
  trashFolder,
  UNKNOWN_ID,
} from "./setup.js";
import restoreFormTool from "../put/restore-form.js";
import getFormByIdTool from "../../form/get/get-form-by-id.js";

const TEST_FOLDER_NAME = "_Test Restore Form Folder";
const TEST_FORM_NAME = "_Test Restore Form";

describe("restore-form", () => {
  setupTestEnvironment();

  let folderId: string | undefined;
  let formId: string | undefined;

  afterEach(async () => {
    if (formId) await purgeForm(formId);
    if (folderId) await purgeFolder(folderId);
    formId = folderId = undefined;
  });

  it("should restore a trashed form to its folder", async () => {
    const context = createMockRequestHandlerExtra();
    folderId = await FormTestHelper.createFolder(TEST_FOLDER_NAME);
    formId = (await new FormBuilder().withName(TEST_FORM_NAME).withFolderId(folderId).create()).getId();
    await trashForm(formId);

    const result = await restoreFormTool.handler({ id: formId }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
    const form = await getFormByIdTool.handler({ id: formId, applyDictionaryTranslations: undefined }, context);
    expect(form.structuredContent).toMatchObject({ trashed: false, folderId });
  });

  it("should restore to the root when the form's folder is still trashed", async () => {
    const context = createMockRequestHandlerExtra();
    folderId = await FormTestHelper.createFolder(TEST_FOLDER_NAME);
    formId = (await new FormBuilder().withName(TEST_FORM_NAME).withFolderId(folderId).create()).getId();
    await trashFolder(folderId);

    await restoreFormTool.handler({ id: formId }, context);

    const form = await getFormByIdTool.handler({ id: formId, applyDictionaryTranslations: undefined }, context);
    expect(form.structuredContent).toMatchObject({ trashed: false, folderId: null });
  });

  it("should return an error for an unknown id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await restoreFormTool.handler({ id: UNKNOWN_ID }, context);

    expect(result.isError).toBe(true);
  });
});
