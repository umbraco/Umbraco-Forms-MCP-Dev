import { z } from "zod";
import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: z.string().uuid().describe("The unique ID of the folder to update"),
  name: z.string().min(1).describe("New name for the folder"),
};

const UpdateFolder = {
  name: "update-folder",
  description: "Update a folder's name. Provide the folder ID and new name. Use this to rename an existing folder.",
  inputSchema,
  slices: ["update"],
  annotations: {
    idempotentHint: true,
  },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.putFolderById(params.id, { name: params.name }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(UpdateFolder);
