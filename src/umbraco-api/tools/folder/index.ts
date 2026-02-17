import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import { FormsAuthorizationPolicies, type FormsUserContext } from "../../../auth/index.js";
import createFolderTool from "./post/create-folder.js";
import getFolderTool from "./get/get-folder.js";
import checkFolderEmptyTool from "./get/check-folder-empty.js";
import updateFolderTool from "./put/update-folder.js";
import moveFolderTool from "./put/move-folder.js";
import deleteFolderTool from "./delete/delete-folder.js";

const readTools = [
  getFolderTool,
  checkFolderEmptyTool,
];

const writeTools = [
  createFolderTool,
  updateFolderTool,
  moveFolderTool,
  deleteFolderTool,
];

const collection: ToolCollectionExport<FormsUserContext> = {
  metadata: {
    name: "folder",
    displayName: "Folder Tools",
    description:
      "Tools for creating, managing, and organizing folders that contain forms and other entities",
  },
  tools: (user: FormsUserContext) => [
    ...(FormsAuthorizationPolicies.HasFormsAccess(user) ? readTools : []),
    ...(FormsAuthorizationPolicies.ManageForms(user) ? writeTools : []),
  ],
};

export default collection;
