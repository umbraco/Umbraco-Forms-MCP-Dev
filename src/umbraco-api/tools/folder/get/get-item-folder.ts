/**
 * Get Item Folder Tool
 *
 * Bulk-looks-up lightweight folder items (name, id, flags) for a set of
 * known folder IDs. This is the "item" endpoint used to resolve display
 * names for references — it is not a tree browser and does not return
 * folders that aren't explicitly requested.
 */

import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getItemFolderResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  ids: z
    .array(z.uuid())
    .optional()
    .describe("IDs of the folders to look up. Omit to return no items."),
};

const outputSchema = z.object({ items: getItemFolderResponse });

const GetItemFolderTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-item-folder",
  description:
    "Looks up basic folder info (name, id, flags) for one or more known folder IDs in a single " +
    "call. Use this to resolve display names for folder IDs you already have — for example " +
    "after getting a parentId back from another tool. This does not browse the folder tree or " +
    "search by name.",
  inputSchema,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async ({ ids }) => {
    return executeGetItemsApiCall<
      ReturnType<ApiClient["getItemFolder"]>,
      ApiClient
    >((client) => client.getItemFolder({ id: ids }, CAPTURE_RAW_HTTP_RESPONSE));
  },
};

export default withStandardDecorators(GetItemFolderTool);
