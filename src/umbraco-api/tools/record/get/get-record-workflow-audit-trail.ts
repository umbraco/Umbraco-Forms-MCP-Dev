import * as zod from "zod";
import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormByFormIdRecordByRecordIdWorkflowAuditTrailParams,
  getFormByFormIdRecordByRecordIdWorkflowAuditTrailResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const outputSchema = zod.object({ items: getFormByFormIdRecordByRecordIdWorkflowAuditTrailResponse });

const GetRecordWorkflowAuditTrailTool = {
  name: "get-record-workflow-audit-trail",
  description:
    "Get the workflow execution history for a specific form submission record. Shows which workflows ran, when they executed, at what stage, and their result. Use list-records first to find record IDs.",
  inputSchema: getFormByFormIdRecordByRecordIdWorkflowAuditTrailParams.shape,
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getFormByFormIdRecordByRecordIdWorkflowAuditTrail"]>, ApiClient>(
      (client) => client.getFormByFormIdRecordByRecordIdWorkflowAuditTrail(params.formId, params.recordId, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof getFormByFormIdRecordByRecordIdWorkflowAuditTrailParams.shape, typeof outputSchema>;

export default withStandardDecorators(GetRecordWorkflowAuditTrailTool);
