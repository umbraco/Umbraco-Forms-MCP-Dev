/**
 * Prevalue Source Tools Collection
 *
 * Tools for managing Umbraco Forms prevalue sources.
 * Includes CRUD operations, value resolution, and tree browsing.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import getPrevalueSourceTool from "./get/get-prevalue-source.js";
import listPrevalueSourcesTool from "./get/list-prevalue-sources.js";
import getPrevalueSourceValuesTool from "./get/get-prevalue-source-values.js";
import getPrevalueSourceTreeTool from "./get/get-prevalue-source-tree.js";
import getPrevalueSourceTreeAncestorsTool from "./get/get-prevalue-source-tree-ancestors.js";
import getPrevalueSourceScaffoldTool from "./get/get-prevalue-source-scaffold.js";
import createPrevalueSourceTool from "./post/create-prevalue-source.js";
import updatePrevalueSourceTool from "./put/update-prevalue-source.js";
import deletePrevalueSourceTool from "./delete/delete-prevalue-source.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "prevalue-source",
    displayName: "Prevalue Source",
    description:
      "Manage prevalue sources for form field options - create, configure, resolve values, and browse",
  },
  tools: () => [
    getPrevalueSourceTool,
    listPrevalueSourcesTool,
    getPrevalueSourceValuesTool,
    getPrevalueSourceTreeTool,
    getPrevalueSourceTreeAncestorsTool,
    getPrevalueSourceScaffoldTool,
    createPrevalueSourceTool,
    updatePrevalueSourceTool,
    deletePrevalueSourceTool,
  ],
};

export default collection;
