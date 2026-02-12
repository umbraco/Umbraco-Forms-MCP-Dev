import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  RecordBuilder,
  RecordTestHelper,
} from "./setup.js";
import listRecordsTool from "../get/list-records.js";

const TEST_NAME = "_Test List Records";

describe("list-records", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await RecordTestHelper.cleanup(TEST_NAME);
  });

  it("should list records for a form", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new RecordBuilder()
      .withFormName(TEST_NAME)
      .withFieldValue("Test Value")
      .create();

    const result = await listRecordsTool.handler(
      {
        formId: builder.getFormId(),
        skip: undefined,
        take: undefined,
        filter: undefined,
        states: undefined,
        sortBy: undefined,
        sortOrder: undefined,
      },
      context
    );

    expect(RecordTestHelper.normalizeIds(result)).toMatchSnapshot();
  });

  it("should return error for non-existent form ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listRecordsTool.handler(
      {
        formId: "00000000-0000-0000-0000-000000000000",
        skip: undefined,
        take: undefined,
        filter: undefined,
        states: undefined,
        sortBy: undefined,
        sortOrder: undefined,
      },
      context
    );

    expect(result.isError).toBe(true);
  });
});
