/**
 * Data Source Type Tool Collection
 *
 * Read-only lookup tools for Umbraco Forms data source types. Data source
 * types are defined by Umbraco Forms core and installed packages — they are
 * not user-created content, so this collection only exposes GET operations.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import listDataSourceTypesTool from "./get/list-data-source-types.js";
import getDataSourceTypeByIdTool from "./get/get-data-source-type-by-id.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "data-source-type",
    displayName: "Data Source Type",
    description:
      "Read-only lookup of Umbraco Forms data source types and the settings schema each type exposes.",
  },
  tools: () => [listDataSourceTypesTool, getDataSourceTypeByIdTool],
};

export default collection;
