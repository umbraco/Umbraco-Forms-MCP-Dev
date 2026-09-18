import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FormTestHelper,
  FormSubmissionBuilder,
} from "./setup.js";
import submitFormEntryTool from "../post/submit-form-entry.js";
import { TEST_FIELD_ALIAS } from "./helpers/form-submission-builder.js";

const TEST_NAME = "_Test Submit Form Entry";

describe("submit-form-entry", () => {
  setupTestEnvironment();

  let builder: FormSubmissionBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should submit form entry via Delivery API", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormSubmissionBuilder().withName(TEST_NAME).create();

    const result = await submitFormEntryTool.handler(
      {
        formId: builder.getId(),
        values: { [TEST_FIELD_ALIAS]: ["Submitted Value"] },
        culture: undefined,
      },
      context
    );

    expect(FormTestHelper.normalizeIds(result)).toMatchSnapshot();
  });

  // Regression: the tool used to carry `withStandardDecorators`, whose
  // URL-oriented sanitiser rejects `?` and `&` in every string. Entry values are
  // a JSON body of human-written prose, so an ordinary answer containing a
  // question mark was impossible to submit. See tools/shared/body-text.ts.
  it("should submit a value containing query-parameter characters", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormSubmissionBuilder().withName(TEST_NAME).create();

    const result = await submitFormEntryTool.handler(
      {
        formId: builder.getId(),
        values: { [TEST_FIELD_ALIAS]: ["Why is it slow? Tea & biscuits."] },
        culture: undefined,
      },
      context
    );

    expect(result.isError).toBeFalsy();
  });

  it("should return error for non-existent form ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await submitFormEntryTool.handler(
      {
        formId: "00000000-0000-0000-0000-000000000000",
        values: { [TEST_FIELD_ALIAS]: ["Test"] },
        culture: undefined,
      },
      context
    );

    expect(result.isError).toBe(true);
    expect(
      result.structuredContent &&
        typeof result.structuredContent === "object" &&
        "error" in result.structuredContent
    ).toBe(true);
  });
});
