/**
 * Get Form Tree Ancestors Tool
 *
 * Lists the folder ancestors of a form/folder in the forms tree, from root down.
 */

import { z } from "zod";
import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getTreeFormAncestorsQueryParams,
  getTreeFormAncestorsResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = getTreeFormAncestorsQueryParams.shape;
const outputSchema = z.object({ items: getTreeFormAncestorsResponse });

const GetFormTreeAncestorsTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-form-tree-ancestors",
  description:
    "Lists the ancestor folders of a form or folder in the Forms tree, ordered from the root down to (but not including) the item itself. Pass the ID of the form or folder as descendantId. Use this to build a breadcrumb path.",
  inputSchema,
  outputSchema,
  slices: ["tree"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ descendantId }) => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getTreeFormAncestors"]>, ApiClient>(
      (client) => client.getTreeFormAncestors({ descendantId }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(GetFormTreeAncestorsTool);
