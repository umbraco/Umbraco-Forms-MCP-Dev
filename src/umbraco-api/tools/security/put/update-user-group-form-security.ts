/**
 * Update User Group Form Security Tool
 *
 * Replaces the Forms security record for an Umbraco user group: its general
 * management permissions and its per-form access overrides. Fetch the current
 * record first with get-user-group-form-security, then send it back here with
 * the desired changes applied — this is a full replace, not a partial patch.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type {
  getUmbracoFormsManagementAPI,
  FormSecurityForGroup,
} from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  putSecurityUserGroupByIdFormSecurityParams,
  putSecurityUserGroupByIdFormSecurityBody,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { assertUserGroupExists } from "../shared/validate-user-group.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

// "key" and "unique" in the API body are the same identifier as the "id" path
// parameter — never make the LLM repeat it, the handler fills both in from id.
const bodySchema = putSecurityUserGroupByIdFormSecurityBody.omit({ key: true, unique: true });

const inputSchema = {
  ...putSecurityUserGroupByIdFormSecurityParams.shape,
  ...bodySchema.shape,
};

const UpdateUserGroupFormSecurityTool = {
  name: "update-user-group-form-security",
  description:
    "Replaces the Forms security configuration for a user group: general management permissions " +
    "(data sources, pre-value sources, workflows, forms, entries) and the per-form access list. " +
    "This is a full replace — always fetch the current configuration with " +
    "get-user-group-form-security first, modify only the fields that need to change, and send the " +
    "whole object back. If the user group has no Forms security record yet, use " +
    "create-user-group-form-security instead.",
  inputSchema,
  slices: ["update", "permissions"],
  annotations: {
    destructiveHint: false,
    idempotentHint: true,
  },
  handler: async ({ id, name, entityType, userGroupSecurity, startFolderIds, formsSecurity }) => {
    await assertUserGroupExists(id);

    const payload: FormSecurityForGroup = {
      key: id,
      unique: id,
      name,
      entityType: entityType ?? null,
      userGroupSecurity,
      startFolderIds,
      formsSecurity,
    };

    return executeVoidApiCall<ApiClient>((client) =>
      client.putSecurityUserGroupByIdFormSecurity(id, payload, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(UpdateUserGroupFormSecurityTool);
