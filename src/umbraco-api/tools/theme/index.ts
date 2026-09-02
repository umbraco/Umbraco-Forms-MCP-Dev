/**
 * Theme Tool Collection
 *
 * Tools for discovering Umbraco Forms themes.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import listThemesTool from "./get/list-themes.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "theme",
    displayName: "Theme",
    description: "List the Umbraco Forms themes available on the server.",
  },
  tools: () => [listThemesTool],
};

export default collection;
