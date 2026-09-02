/**
 * Workflow Type Tool Collection
 *
 * Read-only reference/lookup tools for Umbraco Forms workflow types. Workflow types
 * are fixed system/package definitions (e.g. Send Email, Send to URL, Add to Umbraco
 * Members Group) — they are not created or edited by users.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import listWorkflowTypesTool from "./get/list-workflow-types.js";
import getWorkflowTypeByIdTool from "./get/get-workflow-type-by-id.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "workflow-type",
    displayName: "Workflow Type",
    description: "Reference lookups for the workflow types available in Umbraco Forms.",
  },
  tools: () => [listWorkflowTypesTool, getWorkflowTypeByIdTool],
};

export default collection;
