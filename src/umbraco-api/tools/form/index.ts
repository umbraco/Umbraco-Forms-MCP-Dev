import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import listFormsTool from "./get/list-forms.js";
import getFormTool from "./get/get-form.js";
import getFormScaffoldTool from "./get/get-form-scaffold.js";
import getFormScaffoldByTemplateTool from "./get/get-form-scaffold-by-template.js";
import listFormTemplates from "./get/list-form-templates.js";
import getFormTreeTool from "./get/get-form-tree.js";
import getFormTreeAncestorsTool from "./get/get-form-tree-ancestors.js";
import getFormRelationsTool from "./get/get-form-relations.js";
import createFormTool from "./post/create-form.js";
import copyFormTool from "./post/copy-form.js";
import copyFormWorkflowsTool from "./post/copy-form-workflows.js";
import updateFormTool from "./put/update-form.js";
import moveFormTool from "./put/move-form.js";
import deleteFormTool from "./delete/delete-form.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "form",
    displayName: "Form Tools",
    description:
      "Tools for managing Umbraco Forms - list, view, create, update, copy, move, delete, and browse form hierarchies",
  },
  tools: () => [
    listFormsTool,
    getFormTool,
    getFormScaffoldTool,
    getFormScaffoldByTemplateTool,
    listFormTemplates,
    getFormTreeTool,
    getFormTreeAncestorsTool,
    getFormRelationsTool,
    createFormTool,
    copyFormTool,
    copyFormWorkflowsTool,
    updateFormTool,
    moveFormTool,
    deleteFormTool,
  ],
};

export default collection;
