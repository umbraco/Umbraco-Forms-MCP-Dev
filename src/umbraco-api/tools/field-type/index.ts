import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import getFieldTypeTool from "./get/get-field-type.js";
import listFieldTypesTool from "./get/list-field-types.js";
import listFieldTypeValidationPatternsTool from "./get/list-field-type-validation-patterns.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "field-type",
    displayName: "Field Type Tools",
    description:
      "Tools for discovering available form field type definitions, their capabilities, and validation patterns",
  },
  tools: () => [getFieldTypeTool, listFieldTypesTool, listFieldTypeValidationPatternsTool],
};

export default collection;
