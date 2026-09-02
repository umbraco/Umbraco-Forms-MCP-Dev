/**
 * Delete Folder Tool
 *
 * Permanently deletes an Umbraco Forms folder by ID. This is not idempotent —
 * a second call against the same ID returns a 404 since the folder no longer
 * exists.
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
  id: z.uuid().describe("ID of the folder to delete."),
};

const DeleteFolderTool: ToolDefinition<typeof inputSchema> = {
  name: "delete-folder",
  description:
    "Permanently deletes a Forms folder by ID. The folder should typically be empty first — " +
    "use is-folder-empty to check before deleting. This is a destructive, irreversible " +
    "action and is not idempotent: calling it again on the same ID fails because the " +
    "folder no longer exists.",
  inputSchema,
  slices: ["delete"],
  annotations: { destructiveHint: true },
  handler: async ({ id }) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.deleteFolderById(id, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(DeleteFolderTool);
