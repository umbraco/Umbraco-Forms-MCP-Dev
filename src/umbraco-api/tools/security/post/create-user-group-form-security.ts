/**
 * Create User Group Form Security Tool
 *
 * Creates the initial Forms security record for an Umbraco user group that does
 * not yet have one: its general management permissions and per-form access list.
 * If the group already has a Forms security record, use
 * update-user-group-form-security instead.
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
  postSecurityUserGroupByIdFormSecurityParams,
  postSecurityUserGroupByIdFormSecurityBody,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { assertUserGroupExists } from "../shared/validate-user-group.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

// "key" and "unique" in the API body are the same identifier as the "id" path
// parameter — never make the LLM repeat it, the handler fills both in from id.
const bodySchema = postSecurityUserGroupByIdFormSecurityBody.omit({ key: true, unique: true });

const inputSchema = {
  ...postSecurityUserGroupByIdFormSecurityParams.shape,
  ...bodySchema.shape,
};

const CreateUserGroupFormSecurityTool = {
  name: "create-user-group-form-security",
  description:
    "Creates the first Forms security record for a user group: general management permissions " +
    "(data sources, pre-value sources, workflows, forms, entries) and per-form access overrides. " +
    "Use only when the user group has no Forms security record yet — get-user-group-form-security " +
    "returns an error in that case. If a record already exists, use " +
    "update-user-group-form-security instead.",
  inputSchema,
  slices: ["create", "permissions"],
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
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
      client.postSecurityUserGroupByIdFormSecurity(id, payload, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(CreateUserGroupFormSecurityTool);
