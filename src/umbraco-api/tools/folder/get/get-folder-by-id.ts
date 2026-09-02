/**
 * Get Folder By ID Tool
 *
 * Fetches a single Umbraco Forms folder's details (name, parent, created date)
 * by its ID.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getFolderByIdResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: z.uuid().describe("ID of the folder to fetch."),
};

const outputSchema = getFolderByIdResponse;

const GetFolderByIdTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-folder-by-id",
  description:
    "Gets a single Forms folder's details — name, created date, and parent folder ID — by its ID. " +
    "Use this to inspect a known folder. To find a folder by name or browse the tree, use a " +
    "different lookup tool first to obtain the ID.",
  inputSchema,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async ({ id }) => {
    return executeGetApiCall<
      ReturnType<ApiClient["getFolderById"]>,
      ApiClient
    >((client) => client.getFolderById(id, CAPTURE_RAW_HTTP_RESPONSE));
  },
};

export default withStandardDecorators(GetFolderByIdTool);
