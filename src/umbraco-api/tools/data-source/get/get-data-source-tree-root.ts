/**
 * Get Data Source Tree Root Tool
 *
 * Returns the top-level folders and data sources shown at the root of the
 * Umbraco Forms data source tree in the backoffice.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getTreeDataSourceRootResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetDataSourceTreeRootTool = {
  name: "get-data-source-tree-root",
  description:
    "Gets the root-level items (folders and data sources) of the Umbraco Forms data " +
    "source tree, mirroring what appears at the top level in the backoffice data source " +
    "picker. Each item indicates whether it is a folder and whether it has children. Use " +
    "get-data-source-ancestors to resolve a specific item's folder path.",
  inputSchema: {},
  outputSchema: getTreeDataSourceRootResponse,
  slices: ["tree"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getTreeDataSourceRoot"]>, ApiClient>((client) =>
      client.getTreeDataSourceRoot(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<Record<string, never>, typeof getTreeDataSourceRootResponse>;

export default withStandardDecorators(GetDataSourceTreeRootTool);
