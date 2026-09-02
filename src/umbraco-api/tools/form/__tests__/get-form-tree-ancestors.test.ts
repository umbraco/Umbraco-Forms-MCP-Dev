import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  validateToolResponse,
  FormBuilder,
  FormTestHelper,
} from "./setup.js";
import getFormTreeAncestorsTool from "../get/get-form-tree-ancestors.js";

const TEST_PARENT_FOLDER_NAME = "_Test Form Tree Ancestors Parent";
const TEST_FORM_NAME = "_Test Form Tree Ancestors Form";

describe("get-form-tree-ancestors", () => {
  setupTestEnvironment();

  let folderId: string;
  let formBuilder: FormBuilder;

  afterEach(async () => {
    if (formBuilder) await formBuilder.delete();
    if (folderId) await FormTestHelper.deleteFolder(folderId);
  });

  // ToolDefinition<..., z.object({ items: ... })> via executeGetItemsApiCall —
  // asserts the real parent folder appears among the form's ancestors.
  it("should list the parent folder as an ancestor of a form placed inside it", async () => {
    const context = createMockRequestHandlerExtra();
    folderId = await FormTestHelper.createFolder(TEST_PARENT_FOLDER_NAME);
    formBuilder = await new FormBuilder().withName(TEST_FORM_NAME).withFolderId(folderId).create();

    const result = await getFormTreeAncestorsTool.handler(
      { descendantId: formBuilder.getId() },
      context,
    );

    const data = validateToolResponse(getFormTreeAncestorsTool, result);
    expect(data.items.some((item) => item.id === folderId)).toBe(true);
  });

  it("should return an empty items array for a non-existent descendant id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFormTreeAncestorsTool.handler(
      { descendantId: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    const data = validateToolResponse(getFormTreeAncestorsTool, result);
    expect(data.items).toEqual([]);
  });
});
