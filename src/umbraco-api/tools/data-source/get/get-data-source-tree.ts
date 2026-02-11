import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getTreeDataSourceRootResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetDataSourceTree = {
  name: "get-data-source-tree",
  description: "Get the data source tree showing all data sources in a hierarchical structure. Returns the root level items with their names, IDs, and folder structure. Use this to browse and discover data sources.",
  inputSchema: {},
  outputSchema: getTreeDataSourceRootResponse,
  slices: ["tree"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getTreeDataSourceRoot"]>, ApiClient>(
      (client) => client.getTreeDataSourceRoot(CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<{}, typeof getTreeDataSourceRootResponse>;

export default withStandardDecorators(GetDataSourceTree);
