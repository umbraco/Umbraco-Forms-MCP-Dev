/**
 * List Security Tree Root Tool
 *
 * Lists the top-level nodes (security folders and user/user-group entries) of
 * the Forms security tree. Use this as the entry point for browsing the tree.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getTreeSecurityRootResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {};
const outputSchema = getTreeSecurityRootResponse;

const ListSecurityTreeRootTool = {
  name: "list-security-tree-root",
  description:
    "Lists the top-level nodes of the Forms security tree — the root folders and any group/user " +
    "security entries not nested in a folder. Use this as the starting point for browsing the " +
    "security tree, then call list-security-tree-children with a node's ID to go deeper.",
  inputSchema,
  outputSchema,
  slices: ["tree"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getTreeSecurityRoot"]>, ApiClient>((client) =>
      client.getTreeSecurityRoot(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(ListSecurityTreeRootTool);
