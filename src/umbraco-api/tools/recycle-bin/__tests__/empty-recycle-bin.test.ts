import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  validateToolResponse,
  FormBuilder,
  purgeForm,
  trashForm,
} from "./setup.js";
import emptyRecycleBinTool from "../delete/empty-recycle-bin.js";
import getRecycleBinRootTool from "../get/get-recycle-bin-root.js";
import getFormByIdTool from "../../form/get/get-form-by-id.js";

const TEST_NAME = "_Test Empty Recycle Bin";

// Empties the whole recycle bin of the instance under test - like every integration
// test here, run it only against a disposable test site.
describe("empty-recycle-bin", () => {
  setupTestEnvironment();

  let formId: string | undefined;

  afterEach(async () => {
    if (formId) await purgeForm(formId);
    formId = undefined;
  });

  it("should permanently delete everything in the recycle bin", async () => {
    const context = createMockRequestHandlerExtra();
    formId = (await new FormBuilder().withName(TEST_NAME).create()).getId();
    await trashForm(formId);

    const result = await emptyRecycleBinTool.handler(context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
    const root = validateToolResponse(getRecycleBinRootTool, await getRecycleBinRootTool.handler(context));
    expect(root.total).toBe(0);
    expect((await getFormByIdTool.handler({ id: formId, applyDictionaryTranslations: undefined }, context)).isError).toBe(true);
  });
});
