import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import type { FormsUserContext } from "../../../auth/index.js";
import getWorkflowTypeTool from "./get/get-workflow-type.js";
import listWorkflowTypesTool from "./get/list-workflow-types.js";

const collection: ToolCollectionExport<FormsUserContext> = {
  metadata: {
    name: "workflow-type",
    displayName: "Workflow Type Tools",
    description:
      "Tools for discovering available workflow type definitions and their configuration settings",
  },
  tools: (_user: FormsUserContext) => [getWorkflowTypeTool, listWorkflowTypesTool],
};

export default collection;
