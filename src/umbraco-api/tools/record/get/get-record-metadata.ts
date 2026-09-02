/**
 * Get Record Metadata Tool
 *
 * Retrieves aggregate metadata (matching record count and last submission
 * date) for a form's records, using the same filters as search-records.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormByFormIdRecordMetadataParams,
  getFormByFormIdRecordMetadataQueryParams,
  getFormByFormIdRecordMetadataResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  formId: getFormByFormIdRecordMetadataParams.shape.formId.describe(
    "ID of the form whose record metadata to fetch.",
  ),
  ...getFormByFormIdRecordMetadataQueryParams.shape,
};

const outputSchema = getFormByFormIdRecordMetadataResponse;

const GetRecordMetadataTool = {
  name: "get-record-metadata",
  description:
    "Gets aggregate metadata for a form's records — the total count of matching records and " +
    "the most recent submission date — without returning the records themselves. Accepts " +
    "the same filters as search-records (state, date range, free-text filter, member, " +
    "specific record IDs) to scope the count. Use this for quick counts/summaries; use " +
    "search-records instead when you need the actual record data.",
  inputSchema,
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ formId, ...query }) => {
    return executeGetApiCall<ReturnType<ApiClient["getFormByFormIdRecordMetadata"]>, ApiClient>(
      (client) => client.getFormByFormIdRecordMetadata(formId, query, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(GetRecordMetadataTool);
