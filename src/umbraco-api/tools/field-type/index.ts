/**
 * Field Type Tool Collection
 *
 * Read-only reference/lookup tools for Umbraco Forms field types. Field types
 * (Short Answer, Long Answer, Checkbox, Dropdown, Date Picker, File Upload, Rich
 * Text, etc.) are fixed system definitions built into Umbraco Forms — they are not
 * created, edited, or deleted by users.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import listFieldTypesTool from "./get/list-field-types.js";
import getFieldTypeByIdTool from "./get/get-field-type-by-id.js";
import getFieldTypeRichtextDatatypeTool from "./get/get-field-type-richtext-datatype.js";
import listFieldTypeValidationPatternsTool from "./get/list-field-type-validation-patterns.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "field-type",
    displayName: "Field Type",
    description:
      "Read-only lookup tools for Umbraco Forms' built-in field types and their validation patterns.",
  },
  tools: () => [
    listFieldTypesTool,
    getFieldTypeByIdTool,
    getFieldTypeRichtextDatatypeTool,
    listFieldTypeValidationPatternsTool,
  ],
};

export default collection;
