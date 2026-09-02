/**
 * Get Prevalue Source Ancestors Tool
 *
 * Returns the chain of ancestor folders (from root down to, but not
 * including, the given item) for a prevalue source or folder in the
 * prevalue source tree. Use this to build breadcrumbs or determine which
 * folder a source lives in.
 */

import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getTreePrevalueSourceAncestorsResponseItem } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  descendantId: z
    .uuid()
    .optional()
    .describe("ID of the prevalue source or folder to get ancestors for. Omit to get the ancestors of the tree root (an empty list)."),
};

const outputSchema = z.object({ items: z.array(getTreePrevalueSourceAncestorsResponseItem) });

const getPrevalueSourceAncestorsTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-prevalue-source-ancestors",
  description:
    "Gets the chain of ancestor folders, from root down to (but not including) the given " +
    "prevalue source or folder, in the prevalue source tree. Use this for breadcrumbs or to " +
    "find which folder an item lives in. Use get-prevalue-source-tree-root to browse the tree " +
    "itself.",
  inputSchema,
  outputSchema,
  slices: ["tree"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ descendantId }) => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getTreePrevalueSourceAncestors"]>, ApiClient>(
      (client) => client.getTreePrevalueSourceAncestors({ descendantId }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(getPrevalueSourceAncestorsTool);
