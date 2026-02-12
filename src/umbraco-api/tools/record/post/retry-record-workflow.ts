import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  postFormByFormIdRecordByRecordIdWorkflowByWorkflowIdRetryParams,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import * as zod from "zod";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const outputSchema = zod.object({
  success: zod.boolean(),
});

const RetryRecordWorkflowTool = {
  name: "retry-record-workflow",
  description:
    "Retry a failed workflow execution for a specific form submission record. Use get-record-workflow-audit-trail first to find the workflow ID and confirm it failed.",
  inputSchema: postFormByFormIdRecordByRecordIdWorkflowByWorkflowIdRetryParams.shape,
  outputSchema,
  slices: ["update"],
  annotations: {
    idempotentHint: false,
  },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.postFormByFormIdRecordByRecordIdWorkflowByWorkflowIdRetry(
        params.formId,
        params.recordId,
        params.workflowId,
        CAPTURE_RAW_HTTP_RESPONSE
      )
    );
  },
} satisfies ToolDefinition<typeof postFormByFormIdRecordByRecordIdWorkflowByWorkflowIdRetryParams.shape, typeof outputSchema>;

export default withStandardDecorators(RetryRecordWorkflowTool);
