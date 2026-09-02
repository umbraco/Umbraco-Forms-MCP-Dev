/**
 * Get User Group Form Security Tool
 *
 * Fetches the form-security configuration (which forms a user group can access,
 * and at what level) for a single Umbraco backoffice user group.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getSecurityUserGroupByIdFormSecurityParams,
  getSecurityUserGroupByIdFormSecurityResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = getSecurityUserGroupByIdFormSecurityParams.shape;
const outputSchema = getSecurityUserGroupByIdFormSecurityResponse;

const GetUserGroupFormSecurityTool = {
  name: "get-user-group-form-security",
  description:
    "Gets the Forms security configuration for a single Umbraco user group: its general " +
    "permissions (manage data sources, workflows, forms, entries) and per-form access overrides. " +
    "Use this before updating a user group's Forms permissions, so the full existing configuration " +
    "can be sent back with changes applied. Returns a 404-style error if the user group has no " +
    "Forms security record yet — use the create tool first in that case.",
  inputSchema,
  outputSchema,
  slices: ["read", "permissions"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id }) => {
    return executeGetApiCall<ReturnType<ApiClient["getSecurityUserGroupByIdFormSecurity"]>, ApiClient>(
      (client) => client.getSecurityUserGroupByIdFormSecurity(id, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(GetUserGroupFormSecurityTool);
