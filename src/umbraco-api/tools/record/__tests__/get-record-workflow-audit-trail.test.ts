import { setupTestEnvironment, createMockRequestHandlerExtra, RecordTestFormHelper } from "./setup.js";
import getRecordWorkflowAuditTrailTool from "../get/get-record-workflow-audit-trail.js";

/**
 * ERROR-PATH ONLY — genuine gap, not worked around here.
 *
 * Same underlying blocker as get-record-audit-trail.test.ts: this tool needs a real
 * recordId (and a workflow having actually run against it) to exercise a happy path, but
 * this instance has no forms with real submitted records and no Management API endpoint
 * exists to create one. Only the error path (an unknown recordId on a real form) can be
 * tested honestly.
 */
describe("get-record-workflow-audit-trail", () => {
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

    const result = await getRecordWorkflowAuditTrailTool.handler(
      { formId, recordId: "00000000-0000-0000-0000-000000000001" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
