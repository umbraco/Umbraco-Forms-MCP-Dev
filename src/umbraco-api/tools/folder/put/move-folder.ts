/**
 * Move Folder Tool
 *
 * Moves an existing Umbraco Forms folder to a different parent folder, or to
 * the root of the Forms tree.
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
  id: z.uuid().describe("ID of the folder to move."),
  parentId: z
    .uuid()
    .optional()
    .describe(
      "ID of the existing folder to move this folder under. Omit to move the folder to the root of the Forms tree.",
    ),
};

const MoveFolderTool: ToolDefinition<typeof inputSchema> = {
  name: "move-folder",
  description:
    "Moves an existing Forms folder to a new parent folder, or to the root of the Forms " +
    "tree if parentId is omitted. This changes the folder's location only — it does not " +
    "rename it. Use update-folder to rename a folder.",
  inputSchema,
  slices: ["move"],
  annotations: { idempotentHint: true },
  handler: async ({ id, parentId }) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.putFolderByIdMove(id, { parentId: parentId ?? null }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(MoveFolderTool);
