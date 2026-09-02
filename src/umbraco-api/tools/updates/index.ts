/**
 * Updates Tool Collection
 *
 * Tools for checking Umbraco Forms version update availability.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import getUpdatesVersionTool from "./get/get-updates-version.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "updates",
    displayName: "Updates",
    description: "Check for available Umbraco Forms version updates.",
  },
  tools: () => [getUpdatesVersionTool],
};

export default collection;
