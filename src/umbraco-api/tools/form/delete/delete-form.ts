/**
 * Delete Form Tool
 *
 * Permanently deletes a form definition by its ID.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { deleteFormByIdParams } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = deleteFormByIdParams.shape;

const DeleteFormTool: ToolDefinition<typeof inputSchema> = {
  name: "delete-form",
  description:
    "Permanently deletes an Umbraco Forms form by its ID. This removes the form definition itself, not its submitted entries. Use has-relations/relations tools first to check whether the form is referenced elsewhere (e.g. embedded on content pages) before deleting. This action cannot be undone and is not idempotent — calling it again on the same ID returns a 404.",
  inputSchema,
  slices: ["delete"],
  annotations: {
    destructiveHint: true,
  },
  handler: async ({ id }) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.deleteFormById(id, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(DeleteFormTool);
