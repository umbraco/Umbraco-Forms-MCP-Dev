/**
 * Folder Tool Collection
 *
 * Tools for managing Umbraco Forms folders — the containers used to organise
 * forms and data sources in the Forms tree.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import createFolderTool from "./post/create-folder.js";
import deleteFolderTool from "./delete/delete-folder.js";
import getFolderByIdTool from "./get/get-folder-by-id.js";
import updateFolderTool from "./put/update-folder.js";
import moveFolderTool from "./put/move-folder.js";
import isFolderEmptyTool from "./get/is-folder-empty.js";
import getItemFolderTool from "./get/get-item-folder.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "folder",
    displayName: "Forms Folder",
    description: "Create, read, rename, move, and delete folders used to organise Umbraco Forms.",
  },
  tools: () => [
    createFolderTool,
    deleteFolderTool,
    getFolderByIdTool,
    updateFolderTool,
    moveFolderTool,
    isFolderEmptyTool,
    getItemFolderTool,
  ],
};

export default collection;
