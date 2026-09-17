import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  getStructuredContent,
  FormTestHelper,
} from "./setup.js";
import createSimpleFormTool from "../post/create-simple-form.js";
import getFormByIdTool from "../get/get-form-by-id.js";
import type { FormDesign } from "../../../api/generated/umbracoFormsManagementApi.js";

const TEST_NAME = "_Test Create Simple Form";

/** Flattens a design's four-level page tree down to its fields. */
function fieldsOf(design: FormDesign) {
  return design.pages.flatMap((page) =>
    page.fieldSets.flatMap((fieldSet) =>
      fieldSet.containers.flatMap((container) => container.fields),
    ),
  );
}

async function fetchDesign(id: string): Promise<FormDesign> {
  const result = await getFormByIdTool.handler(
    { id, applyDictionaryTranslations: undefined },
    createMockRequestHandlerExtra(),
  );
  return getStructuredContent(result) as unknown as FormDesign;
}

describe("create-simple-form", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should create a form from a name and a list of fields", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createSimpleFormTool.handler(
      {
        name: TEST_NAME,
        fields: [
          { label: "Full name", type: "text", required: true },
          { label: "Email", type: "email", required: true },
        ],
      } as never,
      context,
    );

    expect(result.isError).toBeFalsy();

    const data = getStructuredContent(result) as { success: boolean; id: string };
    expect(data.success).toBe(true);

    const found = await FormTestHelper.findByName(TEST_NAME);
    expect(found).toBeDefined();
    expect(found?.id).toBe(data.id);

    expect(createSnapshotResult(result, data.id)).toMatchSnapshot();

    const design = await fetchDesign(found!.id);
    const fields = fieldsOf(design);

    expect(fields.map((field) => field.caption)).toEqual(["Full name", "Email"]);
    expect(fields.every((field) => field.mandatory)).toBe(true);
    // Aliases are derived from the labels rather than supplied by the caller.
    expect(fields.map((field) => field.alias)).toEqual(["fullName", "email"]);
  });

  it("should map friendly types onto field types and settings", async () => {
    const context = createMockRequestHandlerExtra();

    await createSimpleFormTool.handler(
      {
        name: TEST_NAME,
        fields: [
          { label: "Email", type: "email" },
          { label: "Phone", type: "phone" },
          { label: "Notes", type: "textarea", rows: 4 },
          {
            label: "Source",
            type: "dropdown",
            options: ["Search", { value: "friend", caption: "A friend" }],
          },
        ],
      } as never,
      context,
    );

    const found = await FormTestHelper.findByName(TEST_NAME);
    const fields = fieldsOf(await fetchDesign(found!.id));

    const byCaption = (caption: string) =>
      fields.find((field) => field.caption === caption)!;

    expect(byCaption("Email").settings.FieldType).toBe("email");
    expect(byCaption("Phone").settings.FieldType).toBe("tel");
    expect(byCaption("Notes").settings.NumberOfRows).toBe("4");
    // Both the plain-string and {value, caption} option shapes are accepted.
    expect(byCaption("Source").preValues).toEqual([
      { value: "Search", caption: "Search" },
      { value: "friend", caption: "A friend" },
    ]);
  });

  it("should group fields into captioned fieldsets", async () => {
    const context = createMockRequestHandlerExtra();

    await createSimpleFormTool.handler(
      {
        name: TEST_NAME,
        fields: [
          { label: "Name", type: "text", group: "About you" },
          { label: "Email", type: "text", group: "About you" },
          { label: "Message", type: "textarea", group: "Your enquiry" },
        ],
      } as never,
      context,
    );

    const found = await FormTestHelper.findByName(TEST_NAME);
    const design = await fetchDesign(found!.id);

    expect(design.pages[0].fieldSets.map((fieldSet) => fieldSet.caption)).toEqual([
      "About you",
      "Your enquiry",
    ]);
    expect(design.pages[0].fieldSets[0].containers[0].fields).toHaveLength(2);
  });

  it("should give colliding labels distinct aliases", async () => {
    const context = createMockRequestHandlerExtra();

    await createSimpleFormTool.handler(
      {
        name: TEST_NAME,
        fields: [
          { label: "Address", type: "text", group: "Home" },
          { label: "Address", type: "text", group: "Work" },
        ],
      } as never,
      context,
    );

    const found = await FormTestHelper.findByName(TEST_NAME);
    const aliases = fieldsOf(await fetchDesign(found!.id)).map((f) => f.alias);

    expect(aliases).toEqual(["address", "address2"]);
  });

  it("should return an error for an unknown field type", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createSimpleFormTool.handler(
      {
        name: TEST_NAME,
        fields: [{ label: "Mystery", type: "notARealType" }],
      } as never,
      context,
    );

    expect(result.isError).toBe(true);
  });
});
