import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  validateToolResponse,
  FormBuilder,
} from "./setup.js";
import updateFormTool from "../put/update-form.js";
import getFormByIdTool from "../get/get-form-by-id.js";

const TEST_NAME = "_Test Update Form";
const TEST_NAME_RENAMED = "_Test Update Form Renamed";

describe("update-form", () => {
  setupTestEnvironment();

  let builder: FormBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should replace the form design with a renamed version", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormBuilder().withName(TEST_NAME).create();

    const getResult = await getFormByIdTool.handler(
      { id: builder.getId(), applyDictionaryTranslations: undefined },
      context,
    );
    const design = validateToolResponse(getFormByIdTool, getResult);

    const result = await updateFormTool.handler(
      { ...design, name: TEST_NAME_RENAMED } as any,
      context,
    );

    expect(createSnapshotResult(result, builder.getId())).toMatchSnapshot();

    const verifyResult = await getFormByIdTool.handler(
      { id: builder.getId(), applyDictionaryTranslations: undefined },
      context,
    );
    const verified = validateToolResponse(getFormByIdTool, verifyResult);
    expect(verified.name).toBe(TEST_NAME_RENAMED);
  });

  it("should return an error for a non-existent form id", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormBuilder().withName(TEST_NAME).create();

    const getResult = await getFormByIdTool.handler(
      { id: builder.getId(), applyDictionaryTranslations: undefined },
      context,
    );
    const design = validateToolResponse(getFormByIdTool, getResult);

    const result = await updateFormTool.handler(
      { ...design, id: "00000000-0000-0000-0000-000000000000" } as any,
      context,
    );

    expect(result.isError).toBe(true);
  });
});
