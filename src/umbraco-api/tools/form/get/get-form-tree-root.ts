/**
 * Get Form Tree Root Tool
 *
 * Lists the top-level folders/forms in the Forms tree.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getTreeFormRootQueryParams,
  getTreeFormRootResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = getTreeFormRootQueryParams.shape;
const outputSchema = getTreeFormRootResponse;

const GetFormTreeRootTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-form-tree-root",
  description:
    "Lists the top-level folders and forms at the root of the Forms tree. Set foldersOnly to true to list only root folders, and ignoreStartFolders to bypass the current user's configured start folders. Use get-form-tree-children to descend into a folder.",
  inputSchema,
  outputSchema,
  slices: ["tree"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ foldersOnly, ignoreStartFolders }) => {
    return executeGetApiCall<ReturnType<ApiClient["getTreeFormRoot"]>, ApiClient>(
      (client) =>
        client.getTreeFormRoot({ foldersOnly, ignoreStartFolders }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(GetFormTreeRootTool);
