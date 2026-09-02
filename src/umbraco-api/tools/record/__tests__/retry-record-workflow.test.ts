import { setupTestEnvironment, createMockRequestHandlerExtra, RecordTestFormHelper } from "./setup.js";
import retryRecordWorkflowTool from "../post/retry-record-workflow.js";

/**
 * ERROR-PATH ONLY — genuine gap, not worked around here.
 *
 * Same underlying blocker as get-record-audit-trail.test.ts: retrying a workflow
 * requires a real record with a real prior workflow execution, but this instance has no
 * forms with real submitted records (and therefore no workflow runs) and no Management
 * API endpoint exists to create either. Only the error path (retrying against an unknown
 * record/workflow on a real form) can be tested honestly.
 */
describe("retry-record-workflow", () => {
  setupTestEnvironment();

  let formId: string;

  beforeAll(async () => {
    formId = await RecordTestFormHelper.createTestForm();
  });

  afterAll(async () => {
    await RecordTestFormHelper.deleteTestForm(formId);
  });

  it("should return error when retrying a workflow for a record that doesn't exist", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await retryRecordWorkflowTool.handler(
      {
        formId,
        recordId: "00000000-0000-0000-0000-000000000001",
        workflowId: "00000000-0000-0000-0000-000000000002",
      },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
