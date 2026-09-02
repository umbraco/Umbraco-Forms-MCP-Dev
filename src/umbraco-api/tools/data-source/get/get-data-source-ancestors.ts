/**
 * Get Data Source Ancestors Tool
 *
 * Returns the ancestor tree items (folder path) leading up to a data source
 * or folder in the Umbraco Forms data source tree.
 */

import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getTreeDataSourceAncestorsResponseItem } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  descendantId: z
    .uuid()
    .optional()
    .describe("Id of the data source or folder to find ancestors for. Omit to get the root-level ancestors only."),
};

const outputSchema = z.object({ items: z.array(getTreeDataSourceAncestorsResponseItem) });

const GetDataSourceAncestorsTool = {
  name: "get-data-source-ancestors",
  description:
    "Gets the chain of ancestor folders (and the root) above a given data source or " +
    "folder in the Umbraco Forms data source tree, ordered from root to the item's " +
    "immediate parent. Use this to resolve the folder path of a data source, e.g. for " +
    "breadcrumb display or to confirm which folder it lives in.",
  inputSchema,
  outputSchema,
  slices: ["tree"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ descendantId }) => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getTreeDataSourceAncestors"]>, ApiClient>((client) =>
      client.getTreeDataSourceAncestors({ descendantId }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(GetDataSourceAncestorsTool);
