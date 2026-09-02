/**
 * Media Tool Collection
 *
 * Tools for resolving Umbraco media items referenced by Umbraco Forms.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import getMediaByPathTool from "./get/get-media-by-path.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "media",
    displayName: "Media",
    description: "Look up Umbraco media items referenced by forms, fields, or themes.",
  },
  tools: () => [getMediaByPathTool],
};

export default collection;
