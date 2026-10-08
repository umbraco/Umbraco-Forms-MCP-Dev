import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FormBuilder,
  purgeForm,
  trashForm,
  UNKNOWN_ID,
} from "./setup.js";
import deleteFormPermanentlyTool from "../delete/delete-form-permanently.js";
import getFormByIdTool from "../../form/get/get-form-by-id.js";

const TEST_NAME = "_Test Delete Form Permanently";

describe("delete-form-permanently", () => {
  setupTestEnvironment();

  let formId: string | undefined;

  afterEach(async () => {
    if (formId) await purgeForm(formId);
    formId = undefined;
  });

  it("should permanently delete a trashed form", async () => {
    const context = createMockRequestHandlerExtra();
    formId = (await new FormBuilder().withName(TEST_NAME).create()).getId();
    await trashForm(formId);

    const result = await deleteFormPermanentlyTool.handler({ id: formId }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
    const form = await getFormByIdTool.handler({ id: formId, applyDictionaryTranslations: undefined }, context);
    expect(form.isError).toBe(true);
  });

  it("should refuse a form that is not in the recycle bin", async () => {
    const context = createMockRequestHandlerExtra();
    formId = (await new FormBuilder().withName(TEST_NAME).create()).getId();

    const result = await deleteFormPermanentlyTool.handler({ id: formId }, context);

    expect(result.isError).toBe(true);
    // The server answers with plain text; it must reach the client as an object (MCP requires one).
    expect(result.structuredContent).toMatchObject({ status: 400, detail: expect.stringContaining("not in the recycle bin") });
    const form = await getFormByIdTool.handler({ id: formId, applyDictionaryTranslations: undefined }, context);
    expect(form.structuredContent).toMatchObject({ trashed: false });
  });

  it("should return an error for an unknown id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteFormPermanentlyTool.handler({ id: UNKNOWN_ID }, context);

    expect(result.isError).toBe(true);
  });
});
