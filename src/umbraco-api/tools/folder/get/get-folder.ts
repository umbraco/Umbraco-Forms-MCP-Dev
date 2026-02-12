import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFolderByIdParams,
  getFolderByIdResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetFolder = {
  name: "get-folder",
  description:
    "Retrieve a folder by its unique ID. Returns the folder name, creation date, and parent folder ID. Use this to inspect a folder's details or verify its location in the folder hierarchy.",
  inputSchema: getFolderByIdParams.shape,
  outputSchema: getFolderByIdResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getFolderById"]>, ApiClient>(
      (client) => client.getFolderById(params.id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof getFolderByIdParams.shape, typeof getFolderByIdResponse>;

export default withStandardDecorators(GetFolder);
