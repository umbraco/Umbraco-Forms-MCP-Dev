/**
 * Retry Record Workflow Tool
 *
 * Re-runs a specific workflow that already executed (e.g. failed) against a
 * form record.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { postFormByFormIdRecordByRecordIdWorkflowByWorkflowIdRetryParams } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  formId: postFormByFormIdRecordByRecordIdWorkflowByWorkflowIdRetryParams.shape.formId.describe(
    "ID of the form the record belongs to.",
  ),
  recordId: postFormByFormIdRecordByRecordIdWorkflowByWorkflowIdRetryParams.shape.recordId.describe(
    "ID of the record (submitted entry) the workflow ran against.",
  ),
  workflowId: postFormByFormIdRecordByRecordIdWorkflowByWorkflowIdRetryParams.shape.workflowId.describe(
    "ID of the specific workflow execution to retry. Get this from " +
      "get-record-workflow-audit-trail (the workflowKey of the failed run).",
  ),
};

const RetryRecordWorkflowTool = {
  name: "retry-record-workflow",
  description:
    "Retries a workflow that already ran against a form record — typically used after a " +
    "workflow failed (e.g. an email or integration workflow) to re-attempt it without " +
    "resubmitting the form. Each call triggers a new execution attempt and is not " +
    "idempotent: calling it again runs the workflow again, even if the previous retry " +
    "succeeded. Use get-record-workflow-audit-trail first to confirm the workflowId and " +
    "that a retry is needed.",
  inputSchema,
  slices: ["action", "workflow"],
  annotations: {
    idempotentHint: false,
  },
  handler: async ({ formId, recordId, workflowId }) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.postFormByFormIdRecordByRecordIdWorkflowByWorkflowIdRetry(
        formId,
        recordId,
        workflowId,
        CAPTURE_RAW_HTTP_RESPONSE,
      ),
    );
  },
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(RetryRecordWorkflowTool);
