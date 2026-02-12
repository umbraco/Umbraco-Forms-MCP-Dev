import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormByFormIdRecordByRecordIdWorkflowAuditTrailParams,
  getFormByFormIdRecordByRecordIdWorkflowAuditTrailResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetRecordWorkflowAuditTrailTool = {
  name: "get-record-workflow-audit-trail",
  description:
    "Get the workflow execution history for a specific form submission record. Shows which workflows ran, when they executed, at what stage, and their result. Use list-records first to find record IDs.",
  inputSchema: getFormByFormIdRecordByRecordIdWorkflowAuditTrailParams.shape,
  outputSchema: getFormByFormIdRecordByRecordIdWorkflowAuditTrailResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getFormByFormIdRecordByRecordIdWorkflowAuditTrail"]>, ApiClient>(
      (client) => client.getFormByFormIdRecordByRecordIdWorkflowAuditTrail(params.formId, params.recordId, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof getFormByFormIdRecordByRecordIdWorkflowAuditTrailParams.shape, typeof getFormByFormIdRecordByRecordIdWorkflowAuditTrailResponse>;

export default withStandardDecorators(GetRecordWorkflowAuditTrailTool);
