import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  RecordBuilder,
  RecordTestHelper,
} from "./setup.js";
import getRecordAuditTrailTool from "../get/get-record-audit-trail.js";

const TEST_NAME = "_Test Get Record Audit Trail";

describe("get-record-audit-trail", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await RecordTestHelper.cleanup(TEST_NAME);
  });

  it("should return audit trail for a record", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new RecordBuilder()
      .withFormName(TEST_NAME)
      .withFieldValue("Test Value")
      .create();

    const result = await getRecordAuditTrailTool.handler(
      {
        formId: builder.getFormId(),
        recordId: builder.getRecordId(),
      },
      context
    );

    expect(RecordTestHelper.normalizeIds(result)).toMatchSnapshot();
  });

  it("should return error for non-existent record ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getRecordAuditTrailTool.handler(
      {
        formId: "00000000-0000-0000-0000-000000000000",
        recordId: "00000000-0000-0000-0000-000000000000",
      },
      context
    );

    expect(result.isError).toBe(true);
  });
});
