import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  validateToolResponse,
  RecordTestFormHelper,
} from "./setup.js";
import { RecordEntryHelper } from "./helpers/record-entry-helper.js";
import getRecordWorkflowAuditTrailTool from "../get/get-record-workflow-audit-trail.js";

describe("get-record-workflow-audit-trail", () => {
  setupTestEnvironment();

  let formId: string;

  beforeAll(async () => {
    formId = await RecordTestFormHelper.createTestForm();
  });

  afterAll(async () => {
    await RecordTestFormHelper.deleteTestForm(formId);
  });

  it("should list the workflows that ran for an entry", async () => {
    const context = createMockRequestHandlerExtra();
    const { builder, recordId } = await RecordEntryHelper.submitEntryWithWorkflow();

    try {
      const result = await getRecordWorkflowAuditTrailTool.handler({ formId: builder.getId(), recordId }, context);

      // The form's own "Send email" workflow ran on submit. (The site may add
      // workflows of its own; the outcome depends on its SMTP settings.)
      const data = validateToolResponse(getRecordWorkflowAuditTrailTool, result);
      expect(data.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "_Test Send Email Workflow", executionStage: "Submitted" }),
        ]),
      );
    } finally {
      await builder.delete();
    }
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
