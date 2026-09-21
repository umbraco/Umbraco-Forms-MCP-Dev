import {
  setupTestEnvironment,
  FormTestHelper,
  FormSubmissionBuilder,
} from "../setup.js";
import { TEST_FIELD_ALIAS } from "./form-submission-builder.js";

const TEST_NAME = "_Test Builder Form Submission";

describe("FormSubmissionBuilder", () => {
  setupTestEnvironment();

  let builder: FormSubmissionBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should create a form with a submittable text field", async () => {
    builder = await new FormSubmissionBuilder().withName(TEST_NAME).create();

    expect(builder.getId()).toBeDefined();

    const design = builder.getDesign();
    expect(design.name).toBe(TEST_NAME);

    const fields = (design.pages as any)[0].fieldSets[0].containers[0].fields;
    const textField = fields.find((field: any) => field.alias === TEST_FIELD_ALIAS);

    expect(textField).toBeDefined();
    expect(textField.mandatory).toBe(false);

    // The scaffold's built-in dataConsent field is left in place, but made
    // optional so an entry can be submitted without it.
    expect(fields.every((field: any) => field.mandatory === false)).toBe(true);

    const found = await FormTestHelper.findByName(TEST_NAME);
    expect(found).toBeDefined();
    expect(found?.id).toBe(builder.getId());
  });

  it("should delete the form it created", async () => {
    builder = await new FormSubmissionBuilder().withName(TEST_NAME).create();

    await builder.delete();

    expect(await FormTestHelper.findByName(TEST_NAME)).toBeUndefined();

    // A second delete is a no-op rather than a 404.
    await expect(builder.delete()).resolves.toBeUndefined();
    builder = undefined;
  });

  it("should throw when read before create", () => {
    const uncreated = new FormSubmissionBuilder();

    expect(() => uncreated.getId()).toThrow("Form not created yet");
    expect(() => uncreated.getDesign()).toThrow("Form not created yet");
  });
});
