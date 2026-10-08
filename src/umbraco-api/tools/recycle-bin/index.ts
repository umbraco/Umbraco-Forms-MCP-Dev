/**
 * Recycle Bin Tool Collection
 *
 * Tools for the Forms recycle bin, which delete-form and delete-folder move
 * items into from Umbraco Forms 17.6 / 18.2: browse it, restore items, and
 * delete them permanently.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";

import deleteFolderPermanentlyTool from "./delete/delete-folder-permanently.js";
import deleteFormPermanentlyTool from "./delete/delete-form-permanently.js";
import emptyRecycleBinTool from "./delete/empty-recycle-bin.js";

import getFolderRestoreDestinationTool from "./get/get-folder-restore-destination.js";
import getFormRestoreDestinationTool from "./get/get-form-restore-destination.js";
import getRecycleBinChildrenTool from "./get/get-recycle-bin-children.js";
import getRecycleBinRootTool from "./get/get-recycle-bin-root.js";

import restoreFolderTool from "./put/restore-folder.js";
import restoreFormTool from "./put/restore-form.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "recycle-bin",
    displayName: "Recycle Bin",
    description:
      "Browse the Forms recycle bin, restore deleted forms and folders, and delete them permanently (Umbraco Forms 17.6 / 18.2 and later).",
  },
  tools: () => [
    deleteFolderPermanentlyTool,
    deleteFormPermanentlyTool,
    emptyRecycleBinTool,
    getFolderRestoreDestinationTool,
    getFormRestoreDestinationTool,
    getRecycleBinChildrenTool,
    getRecycleBinRootTool,
    restoreFolderTool,
    restoreFormTool,
  ],
};

export default collection;
