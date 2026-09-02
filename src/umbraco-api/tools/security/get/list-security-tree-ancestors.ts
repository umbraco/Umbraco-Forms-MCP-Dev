/**
 * List Security Tree Ancestors Tool
 *
 * Lists the ancestor path (folders and groups) leading up to a node in the
 * Forms security tree, given a descendant's ID. Use this to build breadcrumbs
 * or to find a security folder's parent chain.
 */

import { z } from "zod";
import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getTreeSecurityAncestorsQueryParams,
  getTreeSecurityAncestorsResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = getTreeSecurityAncestorsQueryParams.shape;
const outputSchema = z.object({ items: getTreeSecurityAncestorsResponse });

const ListSecurityTreeAncestorsTool = {
  name: "list-security-tree-ancestors",
  description:
    "Lists the ancestor nodes (from root down to the immediate parent) of a node in the Forms " +
    "security tree, given the ID of a descendant node. Omit descendantId to get the root-level " +
    "ancestors. Use this to build a breadcrumb path for a security folder or group in the tree.",
  inputSchema,
  outputSchema,
  slices: ["tree"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ descendantId }) => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getTreeSecurityAncestors"]>, ApiClient>(
      (client) => client.getTreeSecurityAncestors({ descendantId }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(ListSecurityTreeAncestorsTool);
