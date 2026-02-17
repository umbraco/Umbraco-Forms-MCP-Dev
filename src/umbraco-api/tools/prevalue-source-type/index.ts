import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import type { FormsUserContext } from "../../../auth/index.js";
import getPrevalueSourceTypeTool from "./get/get-prevalue-source-type.js";
import listPrevalueSourceTypesTool from "./get/list-prevalue-source-types.js";

const collection: ToolCollectionExport<FormsUserContext> = {
  metadata: {
    name: "prevalue-source-type",
    displayName: "Prevalue Source Type Tools",
    description:
      "Tools for discovering available prevalue source type definitions and their configuration settings",
  },
  tools: (_user: FormsUserContext) => [getPrevalueSourceTypeTool, listPrevalueSourceTypesTool],
};

export default collection;
