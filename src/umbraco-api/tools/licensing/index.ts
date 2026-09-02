/**
 * Licensing Tool Collection
 *
 * Tools for inspecting the Umbraco Forms license status.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import getLicensingStatusTool from "./get/get-licensing-status.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "licensing",
    displayName: "Licensing",
    description: "Check the Umbraco Forms license status and its limitations.",
  },
  tools: () => [getLicensingStatusTool],
};

export default collection;
