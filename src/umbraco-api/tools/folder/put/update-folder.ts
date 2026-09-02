/**
 * Update Folder Tool
 *
 * Renames an existing Umbraco Forms folder. To change a folder's parent
 * (move it in the tree), use the move-folder tool instead.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: z.uuid().describe("ID of the folder to rename."),
  name: z.string().min(1).describe("New name for the folder."),
};

const UpdateFolderTool: ToolDefinition<typeof inputSchema> = {
  name: "update-folder",
  description:
    "Renames an existing Forms folder. This only changes the folder's name — it does not " +
    "move the folder to a different parent. Use move-folder to change a folder's location " +
    "in the tree.",
  inputSchema,
  slices: ["update"],
  annotations: { idempotentHint: true },
  handler: async ({ id, name }) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.putFolderById(id, { name }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(UpdateFolderTool);
