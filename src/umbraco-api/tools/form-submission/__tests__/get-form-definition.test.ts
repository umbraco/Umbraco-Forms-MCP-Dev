import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FormTestHelper,
  FormSubmissionBuilder,
} from "./setup.js";
import getFormDefinitionTool from "../get/get-form-definition.js";

const TEST_NAME = "_Test Get Form Definition";

describe("get-form-definition", () => {
  setupTestEnvironment();

  let builder: FormSubmissionBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should return form definition from Delivery API", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormSubmissionBuilder().withName(TEST_NAME).create();

    const result = await getFormDefinitionTool.handler(
      { id: builder.getId() },
      context
    );

    expect(FormTestHelper.normalizeIds(result)).toMatchSnapshot();
  });

  it("should return error for non-existent form ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFormDefinitionTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context
    );

    expect(result.isError).toBe(true);
  });
});
