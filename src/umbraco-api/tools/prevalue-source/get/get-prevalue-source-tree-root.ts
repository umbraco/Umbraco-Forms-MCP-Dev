/**
 * Get Prevalue Source Tree Root Tool
 *
 * Lists the top-level items (prevalue sources and folders) in the prevalue
 * source tree, as shown in the Umbraco Forms backoffice. Use this to browse
 * or discover prevalue sources by name when you don't already know an ID.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getTreePrevalueSourceRootResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const outputSchema = getTreePrevalueSourceRootResponse;

const getPrevalueSourceTreeRootTool: ToolDefinition<undefined, typeof outputSchema> = {
  name: "get-prevalue-source-tree-root",
  description:
    "Lists the top-level items (prevalue sources and folders) in the prevalue source tree, " +
    "matching the Umbraco Forms backoffice view. Use this to browse and discover prevalue " +
    "sources by name, then use get-prevalue-source-ancestors or list-prevalue-sources to go " +
    "deeper.",
  outputSchema,
  slices: ["tree"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getTreePrevalueSourceRoot"]>, ApiClient>(
      (client) => client.getTreePrevalueSourceRoot(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(getPrevalueSourceTreeRootTool);
