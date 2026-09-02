/**
 * Delete User Group Form Security Tool
 *
 * Removes the entire Forms security record for an Umbraco user group, revoking
 * every general and per-form permission the group previously had in Forms.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { deleteSecurityUserGroupByIdFormSecurityParams } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = deleteSecurityUserGroupByIdFormSecurityParams.shape;

const DeleteUserGroupFormSecurityTool = {
  name: "delete-user-group-form-security",
  description:
    "Deletes the Forms security record for a user group, revoking all of its Forms permissions " +
    "(general management rights and every per-form access override). This is destructive and not " +
    "idempotent — calling it again after the record is gone fails. Use update-user-group-form-security " +
    "instead if you only want to change some permissions.",
  inputSchema,
  slices: ["delete", "permissions"],
  annotations: {
    destructiveHint: true,
    idempotentHint: false,
  },
  handler: async ({ id }) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.deleteSecurityUserGroupByIdFormSecurity(id, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(DeleteUserGroupFormSecurityTool);
