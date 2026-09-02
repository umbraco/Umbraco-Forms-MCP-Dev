/**
 * List Security Tree Children Tool
 *
 * Lists the child nodes (security folders and user/user-group entries) directly
 * beneath a given node in the Forms security tree.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getTreeSecurityChildrenByParentIdParams,
  getTreeSecurityChildrenByParentIdResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = getTreeSecurityChildrenByParentIdParams.shape;
const outputSchema = getTreeSecurityChildrenByParentIdResponse;

const ListSecurityTreeChildrenTool = {
  name: "list-security-tree-children",
  description:
    "Lists the direct children of a node in the Forms security tree, given the parent node's ID. " +
    "Use list-security-tree-root first to find a top-level parentId, or list-security-tree-ancestors " +
    "to navigate upward. Returns folders and group/user security entries with a total count.",
  inputSchema,
  outputSchema,
  slices: ["tree"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ parentId }) => {
    return executeGetApiCall<ReturnType<ApiClient["getTreeSecurityChildrenByParentId"]>, ApiClient>(
      (client) => client.getTreeSecurityChildrenByParentId(parentId, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(ListSecurityTreeChildrenTool);
