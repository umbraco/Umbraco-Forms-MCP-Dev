/**
 * Delete Folder Permanently Tool
 *
 * Permanently deletes a folder that is already in the Forms recycle bin.
 */

import {
  withStandardDecorators,
  executeVoidApiCallWithOptions,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { deleteFolderByIdPermanentParams } from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { withFormsFeature } from "../../shared/forms-version.js";
import { textErrorBodyAsProblemDetails } from "../shared/text-error-body.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: deleteFolderByIdPermanentParams.shape.id.describe("ID of the trashed folder to delete permanently."),
};

const DeleteFolderPermanentlyTool: ToolDefinition<typeof inputSchema> = {
  name: "delete-folder-permanently",
  description:
    "Permanently deletes a folder that is already in the Forms recycle bin, together with every form and folder inside it. " +
    "This cannot be undone. Only works on a trashed folder: move a live one to the recycle bin with delete-folder first. " +
    "Confirm with the user before calling this.",
  inputSchema,
  slices: ["delete"],
  annotations: {
    destructiveHint: true,
  },
  handler: async ({ id }) => {
    return executeVoidApiCallWithOptions<ApiClient>(
      (client) => client.deleteFolderByIdPermanent(id, CAPTURE_RAW_HTTP_RESPONSE),
      { transformError: textErrorBodyAsProblemDetails },
    );
  },
};

export default withStandardDecorators(withFormsFeature("recycleBin", DeleteFolderPermanentlyTool));
