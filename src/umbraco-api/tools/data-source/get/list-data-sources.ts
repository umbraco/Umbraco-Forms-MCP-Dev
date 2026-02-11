import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getDataSourceQueryParams,
  getDataSourceResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const ListDataSources = {
  name: "list-data-sources",
  description:
    "List all form data sources with optional pagination. Returns an array of data sources with their names, types, settings, and validity status. Use this to discover available data sources before working with a specific one.",
  inputSchema: getDataSourceQueryParams.shape,
  outputSchema: getDataSourceResponse,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getDataSource"]>, ApiClient>(
      (client) => client.getDataSource(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof getDataSourceQueryParams.shape, typeof getDataSourceResponse>;

export default withStandardDecorators(ListDataSources);
