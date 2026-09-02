import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  validateToolResponse,
  FormBuilder,
  FormTestHelper,
} from "./setup.js";
import moveFormTool from "../put/move-form.js";
import getFormByIdTool from "../get/get-form-by-id.js";

const TEST_FORM_NAME = "_Test Move Form";
const TEST_FOLDER_NAME = "_Test Move Form Folder";

describe("move-form", () => {
  setupTestEnvironment();

  let builder: FormBuilder;
  let folderId: string;

  afterEach(async () => {
    if (builder) await builder.delete();
    if (folderId) await FormTestHelper.deleteFolder(folderId);
  });

  // Verifies the parentId -> { parentId } flattened body is actually sent —
  // a root-only test would pass even if this were broken, since the API
  // accepts parentId: null happily either way.
  it("should move a form into a real folder", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormBuilder().withName(TEST_FORM_NAME).create();
    folderId = await FormTestHelper.createFolder(TEST_FOLDER_NAME);

    const result = await moveFormTool.handler(
      { id: builder.getId(), parentId: folderId },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();

    const getResult = await getFormByIdTool.handler(
      { id: builder.getId(), applyDictionaryTranslations: undefined },
      context,
    );
    const design = validateToolResponse(getFormByIdTool, getResult);
    expect(design.folderId).toBe(folderId);
  });

  it("should return an error for a non-existent form id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await moveFormTool.handler(
      { id: "00000000-0000-0000-0000-000000000000", parentId: undefined },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
