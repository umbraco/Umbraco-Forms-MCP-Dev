/**
 * Get Form Tree Children Tool
 *
 * Lists the child folders/forms directly beneath a folder in the Forms tree.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getTreeFormChildrenByParentIdParams,
  getTreeFormChildrenByParentIdQueryParams,
  getTreeFormChildrenByParentIdResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  ...getTreeFormChildrenByParentIdParams.shape,
  ...getTreeFormChildrenByParentIdQueryParams.shape,
};
const outputSchema = getTreeFormChildrenByParentIdResponse;

const GetFormTreeChildrenTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-form-tree-children",
  description:
    "Lists the folders and forms directly beneath a given folder in the Forms tree. Set foldersOnly to true to list only subfolders (useful for a folder picker), and ignoreStartFolders to bypass the current user's configured start folders.",
  inputSchema,
  outputSchema,
  slices: ["tree"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ parentId, foldersOnly, ignoreStartFolders }) => {
    return executeGetApiCall<
      ReturnType<ApiClient["getTreeFormChildrenByParentId"]>,
      ApiClient
    >((client) =>
      client.getTreeFormChildrenByParentId(
        parentId,
        { foldersOnly, ignoreStartFolders },
        CAPTURE_RAW_HTTP_RESPONSE,
      ),
    );
  },
};

export default withStandardDecorators(GetFormTreeChildrenTool);
