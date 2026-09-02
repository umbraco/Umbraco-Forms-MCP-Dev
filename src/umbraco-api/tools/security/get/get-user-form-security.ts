/**
 * Get User Form Security Tool
 *
 * Fetches the form-security configuration (which forms a specific backoffice
 * user can access, and at what level) for that user.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getSecurityUserByIdFormSecurityParams,
  getSecurityUserByIdFormSecurityQueryParams,
  getSecurityUserByIdFormSecurityResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  ...getSecurityUserByIdFormSecurityParams.shape,
  ...getSecurityUserByIdFormSecurityQueryParams.shape,
};
const outputSchema = getSecurityUserByIdFormSecurityResponse;

const GetUserFormSecurityTool = {
  name: "get-user-form-security",
  description:
    "Gets the Forms security configuration for a single backoffice user: their general " +
    "permissions (manage data sources, workflows, forms, entries) and per-form access overrides. " +
    "Set explicitOnly to true to see only permissions granted directly to the user, excluding " +
    "permissions inherited from the user's groups. Use this before updating a user's Forms " +
    "permissions so the full existing configuration can be sent back with changes applied.",
  inputSchema,
  outputSchema,
  slices: ["read", "permissions"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id, explicitOnly }) => {
    return executeGetApiCall<ReturnType<ApiClient["getSecurityUserByIdFormSecurity"]>, ApiClient>(
      (client) =>
        client.getSecurityUserByIdFormSecurity(id, { explicitOnly }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(GetUserFormSecurityTool);
