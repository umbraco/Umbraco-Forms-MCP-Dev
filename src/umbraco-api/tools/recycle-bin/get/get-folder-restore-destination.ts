/**
 * Get Folder Restore Destination Tool
 *
 * Previews where a trashed folder would be restored to, without restoring it.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFolderByIdOriginalParentParams,
  getFolderByIdOriginalParentResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { withFormsFeature } from "../../shared/forms-version.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: getFolderByIdOriginalParentParams.shape.id.describe("ID of the trashed folder."),
};
const outputSchema = getFolderByIdOriginalParentResponse;

const GetFolderRestoreDestinationTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-folder-restore-destination",
  description:
    "Previews where restore-folder would put a trashed folder, without restoring it. Returns the folder's name " +
    "(itemName) and the ID of the folder it would land in (destinationId) - null means the root of the Forms tree. " +
    "That is the folder it was deleted from, or the root if that folder is itself still in the recycle bin.",
  inputSchema,
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id }) => {
    return executeGetApiCall<ReturnType<ApiClient["getFolderByIdOriginalParent"]>, ApiClient>(
      (client) => client.getFolderByIdOriginalParent(id, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(withFormsFeature("recycleBin", GetFolderRestoreDestinationTool));
