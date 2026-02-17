/**
 * Data Source Tools Collection
 *
 * Tools for managing Umbraco Forms data sources.
 * Includes CRUD operations and tree browsing.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import { FormsAuthorizationPolicies, type FormsUserContext } from "../../../auth/index.js";
import getDataSourceTool from "./get/get-data-source.js";
import listDataSourcesTool from "./get/list-data-sources.js";
import getDataSourceTreeTool from "./get/get-data-source-tree.js";
import getDataSourceTreeAncestorsTool from "./get/get-data-source-tree-ancestors.js";
import getDataSourceScaffoldTool from "./get/get-data-source-scaffold.js";
import createDataSourceTool from "./post/create-data-source.js";
import updateDataSourceTool from "./put/update-data-source.js";
import deleteDataSourceTool from "./delete/delete-data-source.js";

const readTools = [
  getDataSourceTool,
  listDataSourcesTool,
  getDataSourceTreeTool,
  getDataSourceTreeAncestorsTool,
  getDataSourceScaffoldTool,
];

const writeTools = [
  createDataSourceTool,
  updateDataSourceTool,
  deleteDataSourceTool,
];

const collection: ToolCollectionExport<FormsUserContext> = {
  metadata: {
    name: "data-source",
    displayName: "Data Source",
    description:
      "Manage Umbraco Forms data sources - create, read, update, delete, and browse",
  },
  tools: (user: FormsUserContext) => [
    ...(FormsAuthorizationPolicies.HasFormsAccess(user) ? readTools : []),
    ...(FormsAuthorizationPolicies.ManageDataSources(user) ? writeTools : []),
  ],
};

export default collection;
