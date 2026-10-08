import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  getStructuredContent,
  FormBuilder,
} from "./setup.js";
import updateFormTool from "../put/update-form.js";
import getFormByIdTool from "../get/get-form-by-id.js";
import type { FormDesign } from "../../../api/generated/umbracoFormsManagementApi.js";

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
    const design = getStructuredContent(getResult) as unknown as FormDesign;

    const result = await updateFormTool.handler(
      { ...design, name: TEST_NAME_RENAMED } as any,
      context,
    );

    expect(createSnapshotResult(result, builder.getId())).toMatchSnapshot();

    const verifyResult = await getFormByIdTool.handler(
      { id: builder.getId(), applyDictionaryTranslations: undefined },
      context,
    );
    const verified = getStructuredContent(verifyResult) as unknown as FormDesign;
    expect(verified.name).toBe(TEST_NAME_RENAMED);
  });

  it("should refuse a design read before someone else saved the form", async () => {
    // Forms 17.6 / 18.2 hand out a concurrencyToken with the design and reject a
    // save carrying one that is no longer current, rather than silently
    // overwriting the other change.
    const context = createMockRequestHandlerExtra();
    builder = await new FormBuilder().withName(TEST_NAME).create();
    const stale = getStructuredContent(
      await getFormByIdTool.handler({ id: builder.getId(), applyDictionaryTranslations: undefined }, context),
    ) as unknown as FormDesign;
    expect(stale.concurrencyToken).toBeTruthy();

    await updateFormTool.handler({ ...stale, name: TEST_NAME_RENAMED } as any, context);
    const result = await updateFormTool.handler({ ...stale, name: `${TEST_NAME} Overwrite` } as any, context);

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toMatchObject({ status: 409 });
    const current = getStructuredContent(
      await getFormByIdTool.handler({ id: builder.getId(), applyDictionaryTranslations: undefined }, context),
    ) as unknown as FormDesign;
    expect(current.name).toBe(TEST_NAME_RENAMED);
  });

  it("should return an error for a non-existent form id", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormBuilder().withName(TEST_NAME).create();

    const getResult = await getFormByIdTool.handler(
      { id: builder.getId(), applyDictionaryTranslations: undefined },
      context,
    );
    const design = getStructuredContent(getResult) as unknown as FormDesign;

    const result = await updateFormTool.handler(
      { ...design, id: "00000000-0000-0000-0000-000000000000" } as any,
      context,
    );

    expect(result.isError).toBe(true);
  });
});
