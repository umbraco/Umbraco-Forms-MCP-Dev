import * as zod from "zod";
import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormByFormIdRecordByRecordIdAuditTrailParams,
  getFormByFormIdRecordByRecordIdAuditTrailResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const outputSchema = zod.object({ items: getFormByFormIdRecordByRecordIdAuditTrailResponse });

const GetRecordAuditTrailTool = {
  name: "get-record-audit-trail",
  description:
    "Get the audit trail for a specific form submission record showing when and by whom the record was updated. Returns a chronological list of audit entries. Use list-records first to find record IDs.",
  inputSchema: getFormByFormIdRecordByRecordIdAuditTrailParams.shape,
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getFormByFormIdRecordByRecordIdAuditTrail"]>, ApiClient>(
      (client) => client.getFormByFormIdRecordByRecordIdAuditTrail(params.formId, params.recordId, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof getFormByFormIdRecordByRecordIdAuditTrailParams.shape, typeof outputSchema>;

export default withStandardDecorators(GetRecordAuditTrailTool);
