/**
 * List Export Types Tool
 *
 * Lists the export types/formats available for generating a form's record export.
 */

import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getExportTypesQueryParams,
  getExportTypesResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  formId: getExportTypesQueryParams.shape.formId.describe(
    "ID of the form to list available export types for. Omit to list the export types available generally.",
  ),
};

const outputSchema = z.object({ items: getExportTypesResponse });

const ListExportTypesTool = {
  name: "list-export-types",
  description:
    "Lists the export types/formats (e.g. Excel, CSV) available for generating a form's " +
    "record export, including each type's alias, display name, description, file " +
    "extension, MIME type, and group. Use the returned alias as the exportType parameter " +
    "for generate-form-export. Use this before generate-form-export to discover valid " +
    "export formats rather than guessing an alias.",
  inputSchema,
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ formId }) => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getExportTypes"]>, ApiClient>(
      (client) => client.getExportTypes({ formId }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(ListExportTypesTool);
