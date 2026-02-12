import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFolderByIdIsEmptyParams,
  getFolderByIdIsEmptyResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const CheckFolderEmpty = {
  name: "check-folder-empty",
  description:
    "Check whether a folder is empty (contains no forms or sub-folders). Returns true if empty, false if it has contents. Use this before attempting to delete a folder.",
  inputSchema: getFolderByIdIsEmptyParams.shape,
  outputSchema: getFolderByIdIsEmptyResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getFolderByIdIsEmpty"]>, ApiClient>(
      (client) => client.getFolderByIdIsEmpty(params.id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof getFolderByIdIsEmptyParams.shape, typeof getFolderByIdIsEmptyResponse>;

export default withStandardDecorators(CheckFolderEmpty);
