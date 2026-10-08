/**
 * Empty Recycle Bin Tool
 *
 * Permanently deletes everything in the Forms recycle bin.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { withFormsFeature } from "../../shared/forms-version.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const EmptyRecycleBinTool: ToolDefinition<undefined> = {
  name: "empty-recycle-bin",
  description:
    "Permanently deletes every form and folder in the Forms recycle bin, with their workflows and version history. " +
    "This cannot be undone. Nothing is deleted if the bin holds a form the current user has been denied access to. " +
    "List the contents with get-recycle-bin-root (and get-recycle-bin-children for trashed folders) and confirm with the user before calling this; to remove a single " +
    "item use delete-form-permanently or delete-folder-permanently.",
  slices: ["delete"],
  annotations: {
    destructiveHint: true,
  },
  handler: async () => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.deleteRecycleBinEmpty(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(withFormsFeature("recycleBin", EmptyRecycleBinTool));
