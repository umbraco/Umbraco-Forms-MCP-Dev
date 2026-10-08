/**
 * Get Form Audit Log Tool
 *
 * Lists who did what to a form and when.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormByIdAuditLogParams,
  getFormByIdAuditLogQueryParams,
  getFormByIdAuditLogResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { withFormsFeature } from "../../shared/forms-version.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: getFormByIdAuditLogParams.shape.id.describe("ID of the form whose audit log to list."),
  orderDirection: getFormByIdAuditLogQueryParams.shape.orderDirection.describe(
    "Descending (newest first) or Ascending.",
  ),
  sinceDate: getFormByIdAuditLogQueryParams.shape.sinceDate.describe(
    "Only list entries from this date-time on (ISO 8601).",
  ),
  skip: getFormByIdAuditLogQueryParams.shape.skip,
  take: getFormByIdAuditLogQueryParams.shape.take,
};
const outputSchema = getFormByIdAuditLogResponse;

const GetFormAuditLogTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-form-audit-log",
  description:
    "Lists the audit log of a form: each entry's backoffice user key (user.id), timestamp and action (logType - e.g. New, Save, Move, " +
    "Copy, Delete, RollBack), with an optional comment. Use it to find out who changed a form and when. Newest " +
    "first unless orderDirection is Ascending; filter with sinceDate.",
  inputSchema,
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id, orderDirection, sinceDate, skip, take }) => {
    return executeGetApiCall<ReturnType<ApiClient["getFormByIdAuditLog"]>, ApiClient>((client) =>
      client.getFormByIdAuditLog(id, { orderDirection, sinceDate, skip, take }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(withFormsFeature("formAuditLog", GetFormAuditLogTool));
