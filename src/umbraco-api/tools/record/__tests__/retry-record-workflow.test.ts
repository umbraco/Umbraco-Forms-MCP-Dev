import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  RecordTestFormHelper,
} from "./setup.js";
import retryRecordWorkflowTool from "../post/retry-record-workflow.js";
import { RecordEntryHelper } from "./helpers/record-entry-helper.js";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

describe("retry-record-workflow", () => {
  setupTestEnvironment();

  let formId: string;

  beforeAll(async () => {
    formId = await RecordTestFormHelper.createTestForm();
  });

  afterAll(async () => {
    await RecordTestFormHelper.deleteTestForm(formId);
  });

  it("should run a workflow again for an entry", async () => {
    const context = createMockRequestHandlerExtra();
    const { builder, recordId } = await RecordEntryHelper.submitEntryWithWorkflow();
    const client = getUmbracoFormsManagementAPI();
    const auditTrail = async () =>
      (await client.getFormByFormIdRecordByRecordIdWorkflowAuditTrail(builder.getId(), recordId)) as unknown as Array<{
        workflowKey: string;
        name: string;
      }>;

    try {
      const before = await auditTrail();
      const workflow = before.find((entry) => entry.name === "_Test Send Email Workflow")!;

      const result = await retryRecordWorkflowTool.handler(
        { formId: builder.getId(), recordId, workflowId: workflow.workflowKey },
        context,
      );

      expect(createSnapshotResult(result)).toMatchSnapshot();
      const runs = (await auditTrail()).filter((entry) => entry.workflowKey === workflow.workflowKey);
      expect(runs.length).toBeGreaterThan(1);
    } finally {
      await builder.delete();
    }
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
