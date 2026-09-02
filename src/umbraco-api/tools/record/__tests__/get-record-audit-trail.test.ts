import { setupTestEnvironment, createMockRequestHandlerExtra, RecordTestFormHelper } from "./setup.js";
import getRecordAuditTrailTool from "../get/get-record-audit-trail.js";

/**
 * ERROR-PATH ONLY — genuine gap, not worked around here.
 *
 * This tool needs a recordId that actually exists to exercise a real happy path. Records
 * (submitted form entries) can only be created through Umbraco Forms' public front-end
 * submission flow, which is not part of the Management API this MCP wraps and isn't
 * reachable from these tests (verified: this instance has zero forms with existing
 * submissions — see search-records.test.ts and record-test-form-helper.ts). There is no
 * Management API endpoint to create a record directly. So there is no real recordId to
 * fetch an audit trail for; only the error path (an unknown recordId on a real form) can
 * be tested honestly.
 */
describe("get-record-audit-trail", () => {
  setupTestEnvironment();

  let formId: string;

  beforeAll(async () => {
    formId = await RecordTestFormHelper.createTestForm();
  });

  afterAll(async () => {
    await RecordTestFormHelper.deleteTestForm(formId);
  });

  it("should return error for a record that doesn't exist", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getRecordAuditTrailTool.handler(
      { formId, recordId: "00000000-0000-0000-0000-000000000001" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
