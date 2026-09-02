/**
 * Get Current User Form Security Tool
 *
 * Fetches the Forms security configuration for the currently authenticated
 * backoffice user — no user ID needed. Useful for checking "what can I do in
 * Forms" without looking up your own user ID first.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getSecurityUserCurrentFormSecurityQueryParams,
  getSecurityUserCurrentFormSecurityResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = getSecurityUserCurrentFormSecurityQueryParams.shape;
const outputSchema = getSecurityUserCurrentFormSecurityResponse;

const GetCurrentUserFormSecurityTool = {
  name: "get-current-user-form-security",
  description:
    "Gets the Forms security configuration for the currently authenticated user: general " +
    "permissions (manage data sources, workflows, forms, entries) and per-form access. Set " +
    "includeFormFieldDetails to true to also include each form's field list. Use this instead of " +
    "get-user-form-security when you don't already know the current user's ID.",
  inputSchema,
  outputSchema,
  slices: ["read", "permissions"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ includeFormFieldDetails }) => {
    return executeGetApiCall<ReturnType<ApiClient["getSecurityUserCurrentFormSecurity"]>, ApiClient>(
      (client) =>
        client.getSecurityUserCurrentFormSecurity(
          { includeFormFieldDetails },
          CAPTURE_RAW_HTTP_RESPONSE,
        ),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(GetCurrentUserFormSecurityTool);
