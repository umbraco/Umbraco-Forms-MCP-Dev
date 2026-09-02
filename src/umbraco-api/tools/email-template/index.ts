/**
 * Email Template Tool Collection
 *
 * Tools for browsing the email template file-system tree in Umbraco Forms.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import getEmailTemplateTreeRootTool from "./get/get-email-template-tree-root.js";
import getEmailTemplateTreeChildrenTool from "./get/get-email-template-tree-children.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "email-template",
    displayName: "Email Template",
    description: "Browse the email template file-system tree in Umbraco Forms.",
  },
  tools: () => [getEmailTemplateTreeRootTool, getEmailTemplateTreeChildrenTool],
};

export default collection;
