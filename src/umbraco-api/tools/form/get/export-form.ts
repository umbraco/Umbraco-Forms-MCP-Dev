/**
 * Export Form Tool
 *
 * Downloads a form definition as an importable file, keyed by a previously
 * generated export GUID.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormExportQueryParams,
  getFormExportResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = getFormExportQueryParams.shape;
const outputSchema = getFormExportResponse;

const ExportFormTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "export-form",
  description:
    "Downloads the exported file content for a form export identified by its GUID. This is the second step of an export flow (the export GUID is typically produced by an export-preparation step in the Umbraco backoffice); it does not export a form by its own ID.",
  inputSchema,
  outputSchema,
  slices: ["export"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ guid }) => {
    return executeGetApiCall<ReturnType<ApiClient["getFormExport"]>, ApiClient>(
      (client) => client.getFormExport({ guid }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(ExportFormTool);
