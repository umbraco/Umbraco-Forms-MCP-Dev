/**
 * Get Record Set Actions Tool
 *
 * Lists the bulk actions (e.g. approve, reject, delete) available to run
 * against a set of form records via execute-record-action.
 */

import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getRecordSetActionsResponseItem } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const outputSchema = z.object({
  items: z.array(getRecordSetActionsResponseItem),
});

const GetRecordSetActionsTool = {
  name: "get-record-set-actions",
  description:
    "Lists the record-set actions available in this Umbraco instance (e.g. approve, " +
    "reject, delete) that can be run against a set of form records. Each action includes " +
    "its id (for execute-record-action), whether it needs user confirmation " +
    "(needsConfirm/confirmMessage), and whether it's available for already-approved " +
    "records. Call this first to discover valid actionId values before calling " +
    "execute-record-action.",
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getRecordSetActions"]>, ApiClient>(
      (client) => client.getRecordSetActions(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<undefined, typeof outputSchema>;

export default withStandardDecorators(GetRecordSetActionsTool);
