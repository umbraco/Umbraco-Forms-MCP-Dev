/**
 * List Users To Assign Tool
 *
 * Lists backoffice users that are valid candidates for being granted explicit
 * Forms security (via create-user-form-security / update-user-form-security).
 * Use this to find a user's ID and display name before assigning permissions.
 */

import { z } from "zod";
import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getSecurityUserUsersToAssignResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {};
const outputSchema = z.object({ items: getSecurityUserUsersToAssignResponse });

const ListUsersToAssignTool = {
  name: "list-users-to-assign",
  description:
    "Lists backoffice users that can be assigned Forms security. Returns each user's ID, display " +
    "name, and kind. Use this to look up a user's ID before calling create-user-form-security or " +
    "update-user-form-security — it avoids guessing or inventing a user ID.",
  inputSchema,
  outputSchema,
  slices: ["list", "permissions"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getSecurityUserUsersToAssign"]>, ApiClient>(
      (client) => client.getSecurityUserUsersToAssign(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(ListUsersToAssignTool);
