/**
 * Restore Folder Tool
 *
 * Brings a folder back out of the Forms recycle bin.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { putFolderByIdRestoreParams } from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { withFormsFeature } from "../../shared/forms-version.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: putFolderByIdRestoreParams.shape.id.describe("ID of the trashed folder to restore."),
};

const RestoreFolderTool: ToolDefinition<typeof inputSchema> = {
  name: "restore-folder",
  description:
    "Restores a folder from the Forms recycle bin to the folder it was deleted from - or to the root of the Forms " +
    "tree if that folder is itself still in the recycle bin. Everything inside the folder comes back with it. If another folder there has taken its name in " +
    "the meantime, a \" (1)\"-style suffix is added. Use get-folder-restore-destination to preview where it will " +
    "land, and get-recycle-bin-root to find trashed items.",
  inputSchema,
  slices: ["update"],
  annotations: {
    destructiveHint: false,
  },
  handler: async ({ id }) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.putFolderByIdRestore(id, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(withFormsFeature("recycleBin", RestoreFolderTool));
