import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import getFormsConfigTool from "./get/get-forms-config.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "config",
    displayName: "Config",
    description: "Instance-wide back-office configuration settings for Umbraco Forms.",
  },
  tools: () => [getFormsConfigTool],
};

export default collection;
