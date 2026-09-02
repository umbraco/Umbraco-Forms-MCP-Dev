/**
 * Form Tool Collection
 *
 * Tools for managing Umbraco Forms form definitions: their designs (pages,
 * fields, workflows), tree/folder placement, references, and import/export.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";

import deleteFormTool from "./delete/delete-form.js";

import exportFormTool from "./get/export-form.js";
import getFormByIdTool from "./get/get-form-by-id.js";
import getFormHasRelationsTool from "./get/get-form-has-relations.js";
import getFormItemsByIdsTool from "./get/get-form-items-by-ids.js";
import getFormReferencedByTool from "./get/get-form-referenced-by.js";
import getFormReferencedDescendantsTool from "./get/get-form-referenced-descendants.js";
import getFormRelationsTool from "./get/get-form-relations.js";
import getFormScaffoldByTemplateTool from "./get/get-form-scaffold-by-template.js";
import getFormScaffoldTool from "./get/get-form-scaffold.js";
import getFormTreeAncestorsTool from "./get/get-form-tree-ancestors.js";
import getFormTreeChildrenTool from "./get/get-form-tree-children.js";
import getFormTreeRootTool from "./get/get-form-tree-root.js";
import getFormsAreReferencedTool from "./get/get-forms-are-referenced.js";
import listAllFormsTool from "./get/list-all-forms.js";
import listFormsTool from "./get/list-forms.js";
import searchFormsTool from "./get/search-forms.js";

import copyFormWorkflowsTool from "./post/copy-form-workflows.js";
import copyFormTool from "./post/copy-form.js";
import createFormTool from "./post/create-form.js";
import importFormTool from "./post/import-form.js";
import validateFormFieldSettingsTool from "./post/validate-form-field-settings.js";
import validateFormWorkflowSettingsTool from "./post/validate-form-workflow-settings.js";

import deleteFormFieldTool from "./put/delete-form-field.js";
import moveFormTool from "./put/move-form.js";
import updateFormTool from "./put/update-form.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "form",
    displayName: "Forms",
    description:
      "Create, read, update, delete, copy, move, import/export and search Umbraco Forms form definitions, and browse them in the Forms tree.",
  },
  tools: () => [
    deleteFormTool,
    exportFormTool,
    getFormByIdTool,
    getFormHasRelationsTool,
    getFormItemsByIdsTool,
    getFormReferencedByTool,
    getFormReferencedDescendantsTool,
    getFormRelationsTool,
    getFormScaffoldByTemplateTool,
    getFormScaffoldTool,
    getFormTreeAncestorsTool,
    getFormTreeChildrenTool,
    getFormTreeRootTool,
    getFormsAreReferencedTool,
    listAllFormsTool,
    listFormsTool,
    searchFormsTool,
    copyFormWorkflowsTool,
    copyFormTool,
    createFormTool,
    importFormTool,
    validateFormFieldSettingsTool,
    validateFormWorkflowSettingsTool,
    deleteFormFieldTool,
    moveFormTool,
    updateFormTool,
  ],
};

export default collection;
