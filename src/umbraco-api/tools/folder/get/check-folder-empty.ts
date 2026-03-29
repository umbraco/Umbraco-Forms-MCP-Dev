import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
  createToolResult,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFolderByIdIsEmptyParams,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const CheckFolderEmpty = {
  name: "check-folder-empty",
  description:
    "Check whether a folder is empty (contains no forms or sub-folders). Returns { isEmpty: true } if empty, { isEmpty: false } if it has contents. Use this before attempting to delete a folder.",
  inputSchema: getFolderByIdIsEmptyParams.shape,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    const result = await executeGetApiCall<ReturnType<ApiClient["getFolderByIdIsEmpty"]>, ApiClient>(
      (client) => client.getFolderByIdIsEmpty(params.id, CAPTURE_RAW_HTTP_RESPONSE)
    );
    // MCP structuredContent must be an object, not a primitive.
    // Wrap the boolean response in an object.
    if (!result.isError && result.structuredContent !== undefined) {
      return createToolResult({ isEmpty: result.structuredContent });
    }
    return result;
  },
} satisfies ToolDefinition<typeof getFolderByIdIsEmptyParams.shape>;

export default withStandardDecorators(CheckFolderEmpty);
