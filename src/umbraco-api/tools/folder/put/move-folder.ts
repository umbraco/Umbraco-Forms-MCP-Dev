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
  id: z.string().uuid().describe("The unique ID of the folder to move"),
  parentId: z.string().uuid().optional().describe("UUID of the new parent folder. Omit to move to root level."),
};

const MoveFolder = {
  name: "move-folder",
  description: "Move a folder to a new parent folder, or to the root level by omitting parentId. Provide the folder ID and the target parent folder ID. Use this to reorganize the folder hierarchy.",
  inputSchema,
  slices: ["move"],
  annotations: {
    idempotentHint: true,
  },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.putFolderByIdMove(params.id, { parentId: params.parentId || null }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(MoveFolder);
