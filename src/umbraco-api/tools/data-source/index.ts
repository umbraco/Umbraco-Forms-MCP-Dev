/**
 * Data Source Tools Collection
 *
 * Tools for managing Umbraco Forms data sources.
 * Includes CRUD operations and tree browsing.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import getDataSourceTool from "./get/get-data-source.js";
import listDataSourcesTool from "./get/list-data-sources.js";
import getDataSourceTreeTool from "./get/get-data-source-tree.js";
import createDataSourceTool from "./post/create-data-source.js";
import updateDataSourceTool from "./put/update-data-source.js";
import deleteDataSourceTool from "./delete/delete-data-source.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "data-source",
    displayName: "Data Source",
    description:
      "Manage Umbraco Forms data sources - create, read, update, delete, and browse",
  },
  tools: () => [
    getDataSourceTool,
    listDataSourcesTool,
    getDataSourceTreeTool,
    createDataSourceTool,
    updateDataSourceTool,
    deleteDataSourceTool,
  ],
};

export default collection;
