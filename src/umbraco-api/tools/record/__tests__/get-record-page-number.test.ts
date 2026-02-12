import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  RecordBuilder,
  RecordTestHelper,
} from "./setup.js";
import getRecordPageNumberTool from "../get/get-record-page-number.js";

const TEST_NAME = "_Test Get Record Page Number";

describe("get-record-page-number", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await RecordTestHelper.cleanup(TEST_NAME);
  });

  it("should return page number for a record", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new RecordBuilder()
      .withFormName(TEST_NAME)
      .withFieldValue("Test Value")
      .create();

    const result = await getRecordPageNumberTool.handler(
      {
        formId: builder.getFormId(),
        recordId: builder.getRecordId(),
        take: undefined,
      },
      context
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle non-existent form ID gracefully", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getRecordPageNumberTool.handler(
      {
        formId: "00000000-0000-0000-0000-000000000000",
        recordId: "00000000-0000-0000-0000-000000000000",
        take: undefined,
      },
      context
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
