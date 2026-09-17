import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  getStructuredContent,
  FormTestHelper,
} from "./setup.js";
import addFormFieldsTool from "../put/add-form-fields.js";
import createSimpleFormTool from "../post/create-simple-form.js";
import getFormByIdTool from "../get/get-form-by-id.js";
import type { FormDesign } from "../../../api/generated/umbracoFormsManagementApi.js";

const TEST_NAME = "_Test Add Form Fields";

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

/** Creates a two-field form grouped under "About you" and returns its id. */
async function seedForm(): Promise<string> {
  await createSimpleFormTool.handler(
    {
      name: TEST_NAME,
      fields: [
        { label: "Full name", type: "text", group: "About you" },
        { label: "Email", type: "email", group: "About you" },
      ],
    } as never,
    createMockRequestHandlerExtra(),
  );
  const found = await FormTestHelper.findByName(TEST_NAME);
  return found!.id;
}

describe("add-form-fields", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should append fields while leaving existing ones untouched", async () => {
    const context = createMockRequestHandlerExtra();
    const formId = await seedForm();
    const before = fieldsOf(await fetchDesign(formId));

    const result = await addFormFieldsTool.handler(
      {
        formId,
        fields: [{ label: "Message", type: "textarea" }],
        pageIndex: undefined,
      } as never,
      context,
    );

    expect(result.isError).toBeFalsy();

    const after = fieldsOf(await fetchDesign(formId));
    expect(after).toHaveLength(before.length + 1);
    // Existing field ids survive the round-trip — this is not a recreate.
    expect(after.map((field) => field.id)).toEqual(
      expect.arrayContaining(before.map((field) => field.id)),
    );
    expect(after.map((field) => field.caption)).toContain("Message");
  });

  it("should add into an existing group and create a missing one", async () => {
    const context = createMockRequestHandlerExtra();
    const formId = await seedForm();

    await addFormFieldsTool.handler(
      {
        formId,
        fields: [
          { label: "Phone", type: "phone", group: "About you" },
          { label: "Budget", type: "number", group: "Your project" },
        ],
        pageIndex: undefined,
      } as never,
      context,
    );

    const design = await fetchDesign(formId);
    const captions = design.pages[0].fieldSets.map(
      (fieldSet) => fieldSet.caption,
    );

    expect(captions).toEqual(["About you", "Your project"]);

    const aboutYou = design.pages[0].fieldSets.find(
      (fieldSet) => fieldSet.caption === "About you",
    )!;
    expect(
      aboutYou.containers.flatMap((container) =>
        container.fields.map((field) => field.caption),
      ),
    ).toContain("Phone");
  });

  it("should not reuse an alias already on the form", async () => {
    const context = createMockRequestHandlerExtra();
    const formId = await seedForm();

    await addFormFieldsTool.handler(
      { formId, fields: [{ label: "Email", type: "email" }], pageIndex: undefined } as never,
      context,
    );

    const aliases = fieldsOf(await fetchDesign(formId)).map(
      (field) => field.alias,
    );
    expect(new Set(aliases).size).toBe(aliases.length);
    expect(aliases).toContain("email2");
  });

  it("should return an error for a non-existent form id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await addFormFieldsTool.handler(
      {
        formId: "00000000-0000-0000-0000-000000000000",
        fields: [{ label: "Message", type: "textarea" }],
        pageIndex: undefined,
      } as never,
      context,
    );

    expect(result.isError).toBe(true);
  });

  it("should return an error when pageIndex is out of range", async () => {
    const context = createMockRequestHandlerExtra();
    const formId = await seedForm();

    const result = await addFormFieldsTool.handler(
      { formId, fields: [{ label: "Message", type: "textarea" }], pageIndex: 9 } as never,
      context,
    );

    expect(result.isError).toBe(true);
  });
});
