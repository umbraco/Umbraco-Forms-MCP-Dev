/**
 * List Picker Document Types Tool
 *
 * Lists the Umbraco document types that can be used as the source for a
 * "picker" field configuration (e.g. mapping form record data onto content
 * of a given document type).
 */

import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getPickerDocumentTypeResponseItem } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {};

const outputSchema = z.object({
  items: z.array(getPickerDocumentTypeResponseItem),
});

const ListPickerDocumentTypesTool = {
  name: "list-picker-document-types",
  description:
    "Lists Umbraco document types available to pick as the target for a Forms field's document-type mapping " +
    "configuration. Each item has an id (alias) and a display value. Use this before mapping form fields to " +
    "document type properties, to discover which document types are available. Read-only, takes no parameters.",
  inputSchema,
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetItemsApiCall<
      ReturnType<ApiClient["getPickerDocumentType"]>,
      ApiClient
    >((client) => client.getPickerDocumentType(CAPTURE_RAW_HTTP_RESPONSE));
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(ListPickerDocumentTypesTool);
