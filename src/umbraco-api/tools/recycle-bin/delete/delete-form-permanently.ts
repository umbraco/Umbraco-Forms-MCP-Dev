/**
 * Delete Form Permanently Tool
 *
 * Permanently deletes a form that is already in the Forms recycle bin.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { deleteFormByIdPermanentParams } from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { withFormsFeature } from "../../shared/forms-version.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: deleteFormByIdPermanentParams.shape.id.describe("ID of the trashed form to delete permanently."),
};

const DeleteFormPermanentlyTool: ToolDefinition<typeof inputSchema> = {
  name: "delete-form-permanently",
  description:
    "Permanently deletes a form that is already in the Forms recycle bin, together with its workflows, version history and user permissions. " +
    "This cannot be undone. Only works on a trashed form: move a live one to the recycle bin with delete-form first. " +
    "Confirm with the user before calling this.",
  inputSchema,
  slices: ["delete"],
  annotations: {
    destructiveHint: true,
  },
  handler: async ({ id }) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.deleteFormByIdPermanent(id, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(withFormsFeature("recycleBin", DeleteFormPermanentlyTool));
