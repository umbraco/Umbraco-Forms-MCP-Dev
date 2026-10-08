import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  getStructuredContent,
  FormTestHelper,
} from "./setup.js";
import deleteFormFieldTool from "../put/delete-form-field.js";
import createSimpleFormTool from "../post/create-simple-form.js";
import getFormByIdTool from "../get/get-form-by-id.js";
import type { FormDesign } from "../../../api/generated/umbracoFormsManagementApi.js";

const TEST_NAME = "_Test Delete Form Field";

function fieldsOf(design: FormDesign) {
  return design.pages.flatMap((page) =>
    page.fieldSets.flatMap((fieldSet) => fieldSet.containers.flatMap((container) => container.fields)),
  );
}

async function fetchDesign(id: string): Promise<FormDesign> {
  const result = await getFormByIdTool.handler(
    { id, applyDictionaryTranslations: undefined },
    createMockRequestHandlerExtra(),
  );
  return getStructuredContent(result) as unknown as FormDesign;
}

/** Creates a two-field form and returns its id. */
async function seedForm(): Promise<string> {
  await createSimpleFormTool.handler(
    {
      name: TEST_NAME,
      fields: [
        { label: "Full name", type: "text" },
        { label: "Email", type: "email" },
      ],
    } as never,
    createMockRequestHandlerExtra(),
  );
  return (await FormTestHelper.findByName(TEST_NAME))!.id;
}

describe("delete-form-field", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should remove one field and leave the rest of the form untouched", async () => {
    const context = createMockRequestHandlerExtra();
    const formId = await seedForm();
    const before = await fetchDesign(formId);
    const email = fieldsOf(before).find((field) => field.caption === "Email")!;

    const result = await deleteFormFieldTool.handler({ formId, fieldId: email.id }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
    const after = await fetchDesign(formId);
    expect(fieldsOf(after).map((field) => field.caption)).toEqual(["Full name"]);
    expect(after.name).toBe(before.name);
  });

  it("should return an error for a field that isn't on the form", async () => {
    const context = createMockRequestHandlerExtra();
    const formId = await seedForm();

    const result = await deleteFormFieldTool.handler(
      { formId, fieldId: "00000000-0000-0000-0000-000000000001" },
      context,
    );

    expect(result.isError).toBe(true);
    expect(fieldsOf(await fetchDesign(formId))).toHaveLength(2);
  });

  it("should return an error for an unknown form", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteFormFieldTool.handler(
      { formId: "00000000-0000-0000-0000-000000000001", fieldId: "00000000-0000-0000-0000-000000000002" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
