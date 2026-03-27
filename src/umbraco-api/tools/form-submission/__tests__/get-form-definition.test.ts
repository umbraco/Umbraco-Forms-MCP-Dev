import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  RecordBuilder,
  RecordTestHelper,
} from "./setup.js";
import getFormDefinitionTool from "../get/get-form-definition.js";

const TEST_NAME = "_Test Get Form Definition";

describe("get-form-definition", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await RecordTestHelper.cleanup(TEST_NAME);
  });

  it("should return form definition from Delivery API", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new RecordBuilder()
      .withFormName(TEST_NAME)
      .withFieldValue("Test Value")
      .create();

    const result = await getFormDefinitionTool.handler(
      { id: builder.getFormId() },
      context
    );

    expect(
      RecordTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
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
