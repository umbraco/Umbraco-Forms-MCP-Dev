/**
 * Delete Folder Tool
 *
 * Deletes an Umbraco Forms folder by ID: moves it, with its contents, to the
 * recycle bin on Umbraco Forms 17.6+, deletes it permanently on earlier releases.
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
    "Deletes a Forms folder by ID. On Umbraco Forms 17.6 and later the folder, and every " +
    "form and folder inside it, is moved to the Forms recycle bin, from where restore-folder " +
    "brings it back and delete-folder-permanently removes it for good. Earlier releases " +
    "delete it permanently, and the folder " +
    "should be empty first — use is-folder-empty to check. Calling it on an ID that no " +
    "longer exists fails.",
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
