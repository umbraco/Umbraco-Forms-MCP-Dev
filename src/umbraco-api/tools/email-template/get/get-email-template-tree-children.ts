/**
 * Get Email Template Tree Children Tool
 *
 * Lists the child items (folders and email templates) directly under a given
 * folder path in the email template file-system tree in Umbraco Forms.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getTreeEmailTemplateChildrenByParentPathParams,
  getTreeEmailTemplateChildrenByParentPathResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = getTreeEmailTemplateChildrenByParentPathParams;
const outputSchema = getTreeEmailTemplateChildrenByParentPathResponse;

const GetEmailTemplateTreeChildrenTool = {
  name: "get-email-template-tree-children",
  description:
    "Gets the child items (folders and email templates) located directly under a given " +
    "folder path in the email template file-system tree in Umbraco Forms. Requires the " +
    "path of the parent folder (as returned by get-email-template-tree-root or a previous " +
    "call to this tool). Use this to descend into a folder; use get-email-template-tree-root " +
    "to start browsing from the top level.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["tree"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ parentPath }) => {
    return executeGetApiCall<
      ReturnType<ApiClient["getTreeEmailTemplateChildrenByParentPath"]>,
      ApiClient
    >((client) =>
      client.getTreeEmailTemplateChildrenByParentPath(parentPath, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema.shape, typeof outputSchema>;

export default withStandardDecorators(GetEmailTemplateTreeChildrenTool);
