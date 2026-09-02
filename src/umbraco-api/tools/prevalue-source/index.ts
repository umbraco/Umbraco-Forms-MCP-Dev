/**
 * Prevalue Source Tool Collection
 *
 * Tools for managing Umbraco Forms prevalue sources — reusable providers
 * (REST, SQL, Umbraco members, etc.) that resolve a dropdown/list field's
 * options at render or submit time.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import getPrevalueSourceTool from "./get/get-prevalue-source.js";
import listPrevalueSourcesTool from "./get/list-prevalue-sources.js";
import getPrevalueSourceScaffoldTool from "./get/get-prevalue-source-scaffold.js";
import getPrevalueSourceTextFileTool from "./get/get-prevalue-source-text-file.js";
import getPrevalueSourceValuesTool from "./get/get-prevalue-source-values.js";
import getPrevalueSourceAncestorsTool from "./get/get-prevalue-source-ancestors.js";
import getPrevalueSourceTreeRootTool from "./get/get-prevalue-source-tree-root.js";
import createPrevalueSourceTool from "./post/create-prevalue-source.js";
import updatePrevalueSourceTool from "./put/update-prevalue-source.js";
import deletePrevalueSourceTool from "./delete/delete-prevalue-source.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "prevalue-source",
    displayName: "Prevalue Sources",
    description: "Tools for managing Umbraco Forms prevalue sources, the reusable providers that resolve dropdown/list field options.",
  },
  tools: () => [
    getPrevalueSourceTool,
    listPrevalueSourcesTool,
    getPrevalueSourceScaffoldTool,
    getPrevalueSourceTextFileTool,
    getPrevalueSourceValuesTool,
    getPrevalueSourceAncestorsTool,
    getPrevalueSourceTreeRootTool,
    createPrevalueSourceTool,
    updatePrevalueSourceTool,
    deletePrevalueSourceTool,
  ],
};

export default collection;
