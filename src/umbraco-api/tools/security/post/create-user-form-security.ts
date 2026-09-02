/**
 * Create User Form Security Tool
 *
 * Creates the initial Forms security record for a backoffice user that does not
 * yet have one: their general management permissions and per-form access list.
 * If the user already has a Forms security record, use update-user-form-security
 * instead.
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
  postSecurityUserByIdFormSecurityParams,
  postSecurityUserByIdFormSecurityBody,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

// "key" and "unique" in the API body are the same identifier as the "id" path
// parameter — never make the LLM repeat it, the handler fills both in from id.
const bodySchema = postSecurityUserByIdFormSecurityBody.omit({ key: true, unique: true });

const inputSchema = {
  ...postSecurityUserByIdFormSecurityParams.shape,
  ...bodySchema.shape,
};

const CreateUserFormSecurityTool = {
  name: "create-user-form-security",
  description:
    "Creates the first Forms security record for a user: general management permissions " +
    "(data sources, pre-value sources, workflows, forms, entries) and per-form access overrides. " +
    "Use only when the user has no Forms security record yet — get-user-form-security returns an " +
    "error in that case. If a record already exists, use update-user-form-security instead.",
  inputSchema,
  slices: ["create", "permissions"],
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
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
      client.postSecurityUserByIdFormSecurity(id, payload, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(CreateUserFormSecurityTool);
