/**
 * Picker Tool Collection
 *
 * Tools for discovering and configuring Umbraco Forms field "picker" data —
 * data types and document types (and their properties/mappings) that a form
 * field's picker or prevalue source can reference.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import listPickerDataTypesTool from "./get/list-picker-data-types.js";
import listPickerDocumentTypesTool from "./get/list-picker-document-types.js";
import getPickerDocumentTypePropertiesTool from "./get/get-picker-document-type-properties.js";
import refreshPickerDocumentTypeMappingsTool from "./post/refresh-picker-document-type-mappings.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "picker",
    displayName: "Picker",
    description:
      "Discover and configure data types and document types (and their property mappings) used by Umbraco Forms field pickers.",
  },
  tools: () => [
    listPickerDataTypesTool,
    listPickerDocumentTypesTool,
    getPickerDocumentTypePropertiesTool,
    refreshPickerDocumentTypeMappingsTool,
  ],
};

export default collection;
