/**
 * Delete User Form Security Tool
 *
 * Removes the entire Forms security record for a backoffice user, revoking every
 * general and per-form permission explicitly granted to that user (permissions
 * inherited from the user's groups are unaffected).
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { deleteSecurityUserByIdFormSecurityParams } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = deleteSecurityUserByIdFormSecurityParams.shape;

const DeleteUserFormSecurityTool = {
  name: "delete-user-form-security",
  description:
    "Deletes the Forms security record explicitly assigned to a user, revoking all of that user's " +
    "own Forms permissions (permissions inherited from group membership are not affected). This is " +
    "destructive and not idempotent — calling it again after the record is gone fails. Use " +
    "update-user-form-security instead if you only want to change some permissions.",
  inputSchema,
  slices: ["delete", "permissions"],
  annotations: {
    destructiveHint: true,
    idempotentHint: false,
  },
  handler: async ({ id }) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.deleteSecurityUserByIdFormSecurity(id, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(DeleteUserFormSecurityTool);
