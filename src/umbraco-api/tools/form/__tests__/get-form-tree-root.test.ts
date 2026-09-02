import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  validateToolResponse,
  FormTestHelper,
} from "./setup.js";
import getFormTreeRootTool from "../get/get-form-tree-root.js";

const TEST_FOLDER_NAME = "_Test Form Tree Root Folder";

describe("get-form-tree-root", () => {
  setupTestEnvironment();

  let folderId: string;

  afterEach(async () => {
    if (folderId) await FormTestHelper.deleteFolder(folderId);
  });

  it("should list a newly created folder at the root of the Forms tree", async () => {
    const context = createMockRequestHandlerExtra();
    folderId = await FormTestHelper.createFolder(TEST_FOLDER_NAME);

    const result = await getFormTreeRootTool.handler(
      { foldersOnly: true, ignoreStartFolders: true },
      context,
    );

    const data = validateToolResponse(getFormTreeRootTool, result);
    expect(data.items.some((item) => item.id === folderId)).toBe(true);
  });
});
