/**
 * Prevalue Source Type Tool Collection
 *
 * Read-only lookup tools for the prevalue source types built into Umbraco Forms
 * (fixed system definitions describing where a prevalue source's values come from).
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import listPrevalueSourceTypesTool from "./get/list-prevalue-source-types.js";
import getPrevalueSourceTypeByIdTool from "./get/get-prevalue-source-type-by-id.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "prevalue-source-type",
    displayName: "Prevalue Source Types",
    description:
      "Read-only reference lookups for the prevalue source types built into Umbraco Forms.",
  },
  tools: () => [listPrevalueSourceTypesTool, getPrevalueSourceTypeByIdTool],
};

export default collection;
