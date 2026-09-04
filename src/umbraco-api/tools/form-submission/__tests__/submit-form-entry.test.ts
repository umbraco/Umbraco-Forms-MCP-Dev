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

    expect(
      result.structuredContent &&
        typeof result.structuredContent === "object" &&
        "error" in result.structuredContent
    ).toBe(true);
  });
});
