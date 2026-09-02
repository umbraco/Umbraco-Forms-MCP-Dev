import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  validateToolResponse,
  FormBuilder,
  FormTestHelper,
} from "./setup.js";
import getFormTreeChildrenTool from "../get/get-form-tree-children.js";

const TEST_PARENT_FOLDER_NAME = "_Test Form Tree Children Parent";
const TEST_FORM_NAME = "_Test Form Tree Children Form";

describe("get-form-tree-children", () => {
  setupTestEnvironment();

  let folderId: string;
  let formBuilder: FormBuilder;

  afterEach(async () => {
    if (formBuilder) await formBuilder.delete();
    if (folderId) await FormTestHelper.deleteFolder(folderId);
  });

  it("should list a form placed inside a real parent folder", async () => {
    const context = createMockRequestHandlerExtra();
    folderId = await FormTestHelper.createFolder(TEST_PARENT_FOLDER_NAME);
    formBuilder = await new FormBuilder().withName(TEST_FORM_NAME).withFolderId(folderId).create();

    const result = await getFormTreeChildrenTool.handler(
      { parentId: folderId, foldersOnly: undefined, ignoreStartFolders: true },
      context,
    );

    const data = validateToolResponse(getFormTreeChildrenTool, result);
    expect(data.items.some((item) => item.id === formBuilder.getId())).toBe(true);
  });

  it("should return an empty items array for a folder with no children", async () => {
    const context = createMockRequestHandlerExtra();
    folderId = await FormTestHelper.createFolder(TEST_PARENT_FOLDER_NAME);

    const result = await getFormTreeChildrenTool.handler(
      { parentId: folderId, foldersOnly: undefined, ignoreStartFolders: true },
      context,
    );

    const data = validateToolResponse(getFormTreeChildrenTool, result);
    expect(data.items).toEqual([]);
  });
});
