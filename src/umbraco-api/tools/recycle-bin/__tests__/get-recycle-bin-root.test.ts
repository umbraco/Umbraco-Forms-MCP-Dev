import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  validateToolResponse,
  FormBuilder,
  purgeForm,
  trashForm,
} from "./setup.js";
import getRecycleBinRootTool from "../get/get-recycle-bin-root.js";

const TEST_NAME = "_Test Recycle Bin Root";

describe("get-recycle-bin-root", () => {
  setupTestEnvironment();

  let formId: string | undefined;

  afterEach(async () => {
    if (formId) await purgeForm(formId);
    formId = undefined;
  });

  it("should list a trashed form", async () => {
    const context = createMockRequestHandlerExtra();
    formId = (await new FormBuilder().withName(TEST_NAME).create()).getId();
    await trashForm(formId);

    const result = await getRecycleBinRootTool.handler(context);

    const data = validateToolResponse(getRecycleBinRootTool, result);
    const item = data.items.find((i) => i.id === formId);
    expect(item).toMatchObject({ name: TEST_NAME, isFolder: false });
  });

  it("should not list a live form", async () => {
    const context = createMockRequestHandlerExtra();
    formId = (await new FormBuilder().withName(TEST_NAME).create()).getId();

    const result = await getRecycleBinRootTool.handler(context);

    const data = validateToolResponse(getRecycleBinRootTool, result);
    expect(data.items.some((i) => i.id === formId)).toBe(false);
  });
});
