/**
 * Get Record Workflow Audit Trail Tool
 *
 * Retrieves the workflow execution history (which workflows ran, when, and
 * with what result) for a single submitted record.
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
  getFormByFormIdRecordByRecordIdWorkflowAuditTrailParams,
  getFormByFormIdRecordByRecordIdWorkflowAuditTrailResponseItem,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  formId: getFormByFormIdRecordByRecordIdWorkflowAuditTrailParams.shape.formId.describe(
    "ID of the form the record belongs to.",
  ),
  recordId: getFormByFormIdRecordByRecordIdWorkflowAuditTrailParams.shape.recordId.describe(
    "ID of the record (submitted entry) to get the workflow audit trail for.",
  ),
};

const outputSchema = z.object({
  items: z.array(getFormByFormIdRecordByRecordIdWorkflowAuditTrailResponseItem),
});

const GetRecordWorkflowAuditTrailTool = {
  name: "get-record-workflow-audit-trail",
  description:
    "Gets the workflow execution history for a single form record: which workflows ran " +
    "against it (name, workflowId), when they executed, at what stage, and their result " +
    "(e.g. success or error). Use this to diagnose whether a record's workflows (email " +
    "notifications, integrations, etc.) ran correctly, and to find the workflowId needed " +
    "for retry-record-workflow on a failed workflow.",
  inputSchema,
  outputSchema,
  slices: ["read", "workflow"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ formId, recordId }) => {
    return executeGetItemsApiCall<
      ReturnType<ApiClient["getFormByFormIdRecordByRecordIdWorkflowAuditTrail"]>,
      ApiClient
    >((client) =>
      client.getFormByFormIdRecordByRecordIdWorkflowAuditTrail(
        formId,
        recordId,
        CAPTURE_RAW_HTTP_RESPONSE,
      ),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(GetRecordWorkflowAuditTrailTool);
