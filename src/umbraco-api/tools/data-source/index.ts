/**
 * Data Source Tool Collection
 *
 * Tools for managing Umbraco Forms data sources — connections to external
 * data (SQL, Umbraco members, XML, etc.) used for prevalue lists, workflows,
 * and generating forms from existing data structures.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import getDataSourceTool from "./get/get-data-source.js";
import listDataSourcesTool from "./get/list-data-sources.js";
import getDataSourceScaffoldTool from "./get/get-data-source-scaffold.js";
import getDataSourceWizardScaffoldTool from "./get/get-data-source-wizard-scaffold.js";
import getDataSourceAncestorsTool from "./get/get-data-source-ancestors.js";
import getDataSourceTreeRootTool from "./get/get-data-source-tree-root.js";
import createDataSourceTool from "./post/create-data-source.js";
import createFormFromDataSourceTool from "./post/create-form-from-data-source.js";
import updateDataSourceTool from "./put/update-data-source.js";
import deleteDataSourceTool from "./delete/delete-data-source.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "data-source",
    displayName: "Data Source",
    description: "Manage Umbraco Forms data sources and generate forms from them.",
  },
  tools: () => [
    getDataSourceTool,
    listDataSourcesTool,
    getDataSourceScaffoldTool,
    getDataSourceWizardScaffoldTool,
    getDataSourceAncestorsTool,
    getDataSourceTreeRootTool,
    createDataSourceTool,
    createFormFromDataSourceTool,
    updateDataSourceTool,
    deleteDataSourceTool,
  ],
};

export default collection;
