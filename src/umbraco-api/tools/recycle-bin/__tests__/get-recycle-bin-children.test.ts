import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  validateToolResponse,
  FormBuilder,
  FormTestHelper,
  purgeFolder,
  trashFolder,
} from "./setup.js";
import getRecycleBinChildrenTool from "../get/get-recycle-bin-children.js";
import getRecycleBinRootTool from "../get/get-recycle-bin-root.js";

const TEST_FOLDER_NAME = "_Test Recycle Bin Children Folder";
const TEST_FORM_NAME = "_Test Recycle Bin Children Form";

describe("get-recycle-bin-children", () => {
  setupTestEnvironment();

  let folderId: string | undefined;

  afterEach(async () => {
    // Purging the folder removes the form inside it too.
    if (folderId) await purgeFolder(folderId);
    folderId = undefined;
  });

  it("should list the forms inside a trashed folder", async () => {
    const context = createMockRequestHandlerExtra();
    folderId = await FormTestHelper.createFolder(TEST_FOLDER_NAME);
    const formId = (await new FormBuilder().withName(TEST_FORM_NAME).withFolderId(folderId).create()).getId();
    await trashFolder(folderId);

    const result = await getRecycleBinChildrenTool.handler({ parentId: folderId }, context);

    const data = validateToolResponse(getRecycleBinChildrenTool, result);
    expect(data.items.map((i) => i.id)).toEqual([formId]);

    // Only the trashed folder itself sits at the root of the bin.
    const root = validateToolResponse(getRecycleBinRootTool, await getRecycleBinRootTool.handler(context));
    expect(root.items.some((i) => i.id === folderId)).toBe(true);
    expect(root.items.some((i) => i.id === formId)).toBe(false);
  });
});
