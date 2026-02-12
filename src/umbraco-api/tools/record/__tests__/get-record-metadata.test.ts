import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  RecordBuilder,
  RecordTestHelper,
} from "./setup.js";
import getRecordMetadataTool from "../get/get-record-metadata.js";

const TEST_NAME = "_Test Get Record Metadata";

describe("get-record-metadata", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await RecordTestHelper.cleanup(TEST_NAME);
  });

  it("should return record count and last submit date", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new RecordBuilder()
      .withFormName(TEST_NAME)
      .withFieldValue("Test Value")
      .create();

    const result = await getRecordMetadataTool.handler(
      { formId: builder.getFormId() },
      context
    );

    expect(
      createSnapshotResult(result, builder.getFormId())
    ).toMatchSnapshot();
  });

  it("should handle non-existent form ID gracefully", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getRecordMetadataTool.handler(
      { formId: "00000000-0000-0000-0000-000000000000" },
      context
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
