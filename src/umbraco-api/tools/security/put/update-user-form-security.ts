/**
 * Update User Form Security Tool
 *
 * Replaces the Forms security record for a backoffice user: their general
 * management permissions and their per-form access overrides. Fetch the current
 * record first with get-user-form-security, then send it back here with the
 * desired changes applied — this is a full replace, not a partial patch.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type {
  getUmbracoFormsManagementAPI,
  FormSecurityForUser,
} from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  putSecurityUserByIdFormSecurityParams,
  putSecurityUserByIdFormSecurityBody,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

// "key" and "unique" in the API body are the same identifier as the "id" path
// parameter — never make the LLM repeat it, the handler fills both in from id.
const bodySchema = putSecurityUserByIdFormSecurityBody.omit({ key: true, unique: true });

const inputSchema = {
  ...putSecurityUserByIdFormSecurityParams.shape,
  ...bodySchema.shape,
};

const UpdateUserFormSecurityTool = {
  name: "update-user-form-security",
  description:
    "Replaces the Forms security configuration for a user: general management permissions " +
    "(data sources, pre-value sources, workflows, forms, entries) and the per-form access list. " +
    "This is a full replace — always fetch the current configuration with get-user-form-security " +
    "first, modify only the fields that need to change, and send the whole object back. If the " +
    "user has no Forms security record yet, use create-user-form-security instead.",
  inputSchema,
  slices: ["update", "permissions"],
  annotations: {
    destructiveHint: false,
    idempotentHint: true,
  },
  handler: async ({ id, name, entityType, userSecurity, startFolderIds, formsSecurity }) => {
    const payload: FormSecurityForUser = {
      key: id,
      unique: id,
      name,
      entityType: entityType ?? null,
      userSecurity,
      startFolderIds,
      formsSecurity,
    };

    return executeVoidApiCall<ApiClient>((client) =>
      client.putSecurityUserByIdFormSecurity(id, payload, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(UpdateUserFormSecurityTool);
