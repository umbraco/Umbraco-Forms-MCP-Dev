/**
 * Search Records Tool
 *
 * Searches submitted entries (records) for a form, with paging, sorting,
 * date-range, state, and free-text filtering.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormByFormIdRecordParams,
  getFormByFormIdRecordQueryParams,
  getFormByFormIdRecordResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  formId: getFormByFormIdRecordParams.shape.formId.describe(
    "ID of the form whose submitted records to search.",
  ),
  ...getFormByFormIdRecordQueryParams.shape,
};

const outputSchema = getFormByFormIdRecordResponse;

const SearchRecordsTool = {
  name: "search-records",
  description:
    "Searches submitted entries (records) for a form. Supports paging (skip/take), " +
    "sorting, filtering by workflow state (e.g. Submitted, Approved, Rejected), a date " +
    "range (startDate/endDate), free-text filter, a specific member, or a set of specific " +
    "record IDs. Returns a page of results plus the field schema needed to interpret each " +
    "result's field values and the total result/page counts. Use this to browse or find " +
    "form submissions; use get-record-metadata for aggregate counts only, or " +
    "get-record-page-number to find which page a specific record falls on.",
  inputSchema,
  outputSchema,
  slices: ["list", "search"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ formId, ...query }) => {
    return executeGetApiCall<ReturnType<ApiClient["getFormByFormIdRecord"]>, ApiClient>(
      (client) => client.getFormByFormIdRecord(formId, query, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(SearchRecordsTool);
