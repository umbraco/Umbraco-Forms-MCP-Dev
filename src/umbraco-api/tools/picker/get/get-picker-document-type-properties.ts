/**
 * Get Picker Document Type Properties Tool
 *
 * Lists the properties of a specific Umbraco document type, for use when
 * configuring how a Forms field maps its picked values onto that document
 * type's properties.
 */

import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getPickerDocumentTypeByAliasPropertiesResponseItem } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  alias: z
    .string()
    .min(1)
    .describe(
      "The alias of the Umbraco document type to list properties for (as returned by list-picker-document-types).",
    ),
};

const outputSchema = z.object({
  items: z.array(getPickerDocumentTypeByAliasPropertiesResponseItem),
});

const GetPickerDocumentTypePropertiesTool = {
  name: "get-picker-document-type-properties",
  description:
    "Gets the list of properties (id and display value) defined on a specific Umbraco document type, identified " +
    "by its alias. Use this to discover which properties of a document type a Forms field can be mapped to, before " +
    "configuring or refreshing a document-type mapping. Requires the document type alias from list-picker-document-types.",
  inputSchema,
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ alias }) => {
    return executeGetItemsApiCall<
      ReturnType<ApiClient["getPickerDocumentTypeByAliasProperties"]>,
      ApiClient
    >((client) =>
      client.getPickerDocumentTypeByAliasProperties(
        alias,
        CAPTURE_RAW_HTTP_RESPONSE,
      ),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(GetPickerDocumentTypePropertiesTool);
