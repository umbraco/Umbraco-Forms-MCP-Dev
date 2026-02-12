import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { deleteFolderByIdParams } from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const DeleteFolder: ToolDefinition<typeof deleteFolderByIdParams.shape> = {
  name: "delete-folder",
  description: "Permanently delete a folder by its ID. The folder must be empty before it can be deleted — use check-folder-empty first to verify. This action cannot be undone.",
  inputSchema: deleteFolderByIdParams.shape,
  slices: ["delete"],
  annotations: {
    destructiveHint: true,
  },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.deleteFolderById(params.id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
};

export default withStandardDecorators(DeleteFolder);
