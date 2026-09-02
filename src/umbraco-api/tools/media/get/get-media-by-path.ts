/**
 * Get Media By Path Tool
 *
 * Looks up an Umbraco media item (e.g. an image referenced by a form's
 * field settings or theme) by its virtual media path, returning its
 * media type, trashed state, and other metadata.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getMediaByPathResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  path: z
    .string()
    .min(1)
    .describe(
      "The virtual media path to look up (e.g. the value stored on a form field or " +
        "theme setting that references a media item). Required — use list/search tools " +
        "elsewhere to discover a path if you don't already have one.",
    ),
};

const GetMediaByPathTool = {
  name: "get-media-by-path",
  description:
    "Gets a single Umbraco media item by its virtual media path, returning details such as " +
    "whether it is trashed and its media type (id, icon, and collection). Use this when a " +
    "form, field, or theme setting stores a media reference by path and you need to resolve " +
    "or validate that reference. Not for browsing or searching the media library — only for " +
    "looking up a specific, already-known path.",
  inputSchema,
  outputSchema: getMediaByPathResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ path }) => {
    return executeGetApiCall<ReturnType<ApiClient["getMediaByPath"]>, ApiClient>((client) =>
      client.getMediaByPath({ path }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof getMediaByPathResponse>;

export default withStandardDecorators(GetMediaByPathTool);
