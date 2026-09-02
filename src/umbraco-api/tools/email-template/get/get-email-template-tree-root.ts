/**
 * Get Email Template Tree Root Tool
 *
 * Lists the top-level (root) items of the email template file-system tree —
 * the folders and email templates stored directly under the email templates
 * root in Umbraco Forms.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getTreeEmailTemplateRootResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const outputSchema = getTreeEmailTemplateRootResponse;

const GetEmailTemplateTreeRootTool = {
  name: "get-email-template-tree-root",
  description:
    "Gets the root-level items (folders and email templates) of the email template " +
    "file-system tree in Umbraco Forms. Each item includes its name, path, whether it " +
    "is a folder, and whether it has children. Use this to start browsing the email " +
    "template tree from the top; use get-email-template-tree-children to descend into " +
    "a specific folder returned here.",
  inputSchema: {},
  outputSchema,
  slices: ["tree"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getTreeEmailTemplateRoot"]>, ApiClient>(
      (client) => client.getTreeEmailTemplateRoot(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<Record<string, never>, typeof outputSchema>;

export default withStandardDecorators(GetEmailTemplateTreeRootTool);
