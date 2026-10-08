/**
 * Get Form Restore Destination Tool
 *
 * Previews where a trashed form would be restored to, without restoring it.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormByIdOriginalParentParams,
  getFormByIdOriginalParentResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { withFormsFeature } from "../../shared/forms-version.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: getFormByIdOriginalParentParams.shape.id.describe("ID of the trashed form."),
};
const outputSchema = getFormByIdOriginalParentResponse;

const GetFormRestoreDestinationTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-form-restore-destination",
  description:
    "Previews where restore-form would put a trashed form, without restoring it. Returns the form's name " +
    "(itemName) and the ID of the folder it would land in (destinationId) - null means the root of the Forms tree. " +
    "That is the folder it was deleted from, or the root if that folder is itself still in the recycle bin.",
  inputSchema,
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id }) => {
    return executeGetApiCall<ReturnType<ApiClient["getFormByIdOriginalParent"]>, ApiClient>(
      (client) => client.getFormByIdOriginalParent(id, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(withFormsFeature("recycleBin", GetFormRestoreDestinationTool));
