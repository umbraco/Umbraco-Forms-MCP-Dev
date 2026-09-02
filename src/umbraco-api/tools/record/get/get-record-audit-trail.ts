/**
 * Get Record Audit Trail Tool
 *
 * Retrieves the change history (who updated a record and when) for a single
 * submitted record.
 */

import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormByFormIdRecordByRecordIdAuditTrailParams,
  getFormByFormIdRecordByRecordIdAuditTrailResponseItem,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  formId: getFormByFormIdRecordByRecordIdAuditTrailParams.shape.formId.describe(
    "ID of the form the record belongs to.",
  ),
  recordId: getFormByFormIdRecordByRecordIdAuditTrailParams.shape.recordId.describe(
    "ID of the record (submitted entry) to get the audit trail for.",
  ),
};

const outputSchema = z.object({
  items: z.array(getFormByFormIdRecordByRecordIdAuditTrailResponseItem),
});

const GetRecordAuditTrailTool = {
  name: "get-record-audit-trail",
  description:
    "Gets the audit trail for a single form record: a chronological list of update events " +
    "showing who updated the record and when. Use this to see the change history of a " +
    "record's field values; use get-record-workflow-audit-trail instead for workflow " +
    "execution history.",
  inputSchema,
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ formId, recordId }) => {
    return executeGetItemsApiCall<
      ReturnType<ApiClient["getFormByFormIdRecordByRecordIdAuditTrail"]>,
      ApiClient
    >((client) =>
      client.getFormByFormIdRecordByRecordIdAuditTrail(formId, recordId, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(GetRecordAuditTrailTool);
