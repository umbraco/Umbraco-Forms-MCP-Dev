/**
 * Search Forms Tool
 *
 * Finds forms by name, with paging.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormSearchQueryParams,
  getFormSearchResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = getFormSearchQueryParams.shape;
const outputSchema = getFormSearchResponse;

const SearchFormsTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "search-forms",
  description:
    "Searches forms by name (partial match via the query parameter), with paging via skip/take. Use this to find a specific form by name rather than paging through the whole list with list-forms.",
  inputSchema,
  outputSchema,
  slices: ["search"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ query, skip, take }) => {
    return executeGetApiCall<ReturnType<ApiClient["getFormSearch"]>, ApiClient>(
      (client) => client.getFormSearch({ query, skip, take }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(SearchFormsTool);
