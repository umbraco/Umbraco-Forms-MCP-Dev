import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import getDataSourceTypeTool from "./get/get-data-source-type.js";
import listDataSourceTypesTool from "./get/list-data-source-types.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "data-source-type",
    displayName: "Data Source Type Tools",
    description:
      "Tools for discovering available data source type definitions and their configuration settings",
  },
  tools: () => [getDataSourceTypeTool, listDataSourceTypesTool],
};

export default collection;
