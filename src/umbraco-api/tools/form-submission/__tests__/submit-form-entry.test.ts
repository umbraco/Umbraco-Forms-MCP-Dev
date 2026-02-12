import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  RecordBuilder,
  RecordTestHelper,
} from "./setup.js";
import submitFormEntryTool from "../post/submit-form-entry.js";

const TEST_NAME = "_Test Submit Form Entry";

describe("submit-form-entry", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await RecordTestHelper.cleanup(TEST_NAME);
  });

  it("should submit form entry via Delivery API", async () => {
    const context = createMockRequestHandlerExtra();
    // Create a form with a record - this proves the form is set up correctly
    const builder = await new RecordBuilder()
      .withFormName(TEST_NAME)
      .withFieldValue("First Value")
      .create();

    // Submit another entry using the tool
    const result = await submitFormEntryTool.handler(
      {
        formId: builder.getFormId(),
        values: { name: ["Second Value"] },
        culture: undefined,
      },
      context
    );

    expect(
      RecordTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });

  it("should return error for non-existent form ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await submitFormEntryTool.handler(
      {
        formId: "00000000-0000-0000-0000-000000000000",
        values: { name: ["Test"] },
        culture: undefined,
      },
      context
    );

    // Check for error in structuredContent
    expect(
      result.structuredContent &&
      typeof result.structuredContent === "object" &&
      "error" in result.structuredContent
    ).toBe(true);
  });
});
