/**
 * Export Tool Collection
 *
 * Tools for generating and downloading form record export files.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import downloadExportFileTool from "./get/download-export-file.js";
import listExportTypesTool from "./get/list-export-types.js";
import generateFormExportTool from "./post/generate-form-export.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "export",
    displayName: "Export",
    description: "Generate and download export files of a form's submitted records.",
  },
  tools: () => [generateFormExportTool, downloadExportFileTool, listExportTypesTool],
};

export default collection;
