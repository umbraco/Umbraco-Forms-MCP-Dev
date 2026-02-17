/**
 * Prevalue Source Tools Collection
 *
 * Tools for managing Umbraco Forms prevalue sources.
 * Includes CRUD operations, value resolution, and tree browsing.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import { FormsAuthorizationPolicies, type FormsUserContext } from "../../../auth/index.js";
import getPrevalueSourceTool from "./get/get-prevalue-source.js";
import listPrevalueSourcesTool from "./get/list-prevalue-sources.js";
import getPrevalueSourceValuesTool from "./get/get-prevalue-source-values.js";
import getPrevalueSourceTreeTool from "./get/get-prevalue-source-tree.js";
import getPrevalueSourceTreeAncestorsTool from "./get/get-prevalue-source-tree-ancestors.js";
import getPrevalueSourceScaffoldTool from "./get/get-prevalue-source-scaffold.js";
import createPrevalueSourceTool from "./post/create-prevalue-source.js";
import updatePrevalueSourceTool from "./put/update-prevalue-source.js";
import deletePrevalueSourceTool from "./delete/delete-prevalue-source.js";

const readTools = [
  getPrevalueSourceTool,
  listPrevalueSourcesTool,
  getPrevalueSourceValuesTool,
  getPrevalueSourceTreeTool,
  getPrevalueSourceTreeAncestorsTool,
  getPrevalueSourceScaffoldTool,
];

const writeTools = [
  createPrevalueSourceTool,
  updatePrevalueSourceTool,
  deletePrevalueSourceTool,
];

const collection: ToolCollectionExport<FormsUserContext> = {
  metadata: {
    name: "prevalue-source",
    displayName: "Prevalue Source",
    description:
      "Manage prevalue sources for form field options - create, configure, resolve values, and browse",
  },
  tools: (user: FormsUserContext) => [
    ...(FormsAuthorizationPolicies.HasFormsAccess(user) ? readTools : []),
    ...(FormsAuthorizationPolicies.ManagePreValueSources(user) ? writeTools : []),
  ],
};

export default collection;
