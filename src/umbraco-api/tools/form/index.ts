import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import listFormsTool from "./get/list-forms.js";
import getFormTool from "./get/get-form.js";
import getFormScaffoldTool from "./get/get-form-scaffold.js";
import getFormTreeTool from "./get/get-form-tree.js";
import getFormRelationsTool from "./get/get-form-relations.js";
import copyFormTool from "./post/copy-form.js";
import moveFormTool from "./put/move-form.js";
import deleteFormTool from "./delete/delete-form.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "form",
    displayName: "Form Tools",
    description:
      "Tools for managing Umbraco Forms - list, view, copy, move, delete, and browse form hierarchies",
  },
  tools: () => [
    listFormsTool,
    getFormTool,
    getFormScaffoldTool,
    getFormTreeTool,
    getFormRelationsTool,
    copyFormTool,
    moveFormTool,
    deleteFormTool,
  ],
};

export default collection;
