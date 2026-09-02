/**
 * List Picker Data Types Tool
 *
 * Lists the Umbraco data types that can be used as the source for a "picker"
 * field configuration (e.g. a dropdown/picker prevalue source backed by a
 * data type).
 */

import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getPickerDataTypeResponseItem } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {};

const outputSchema = z.object({
  items: z.array(getPickerDataTypeResponseItem),
});

const ListPickerDataTypesTool = {
  name: "list-picker-data-types",
  description:
    "Lists Umbraco data types available to pick as the source for a Forms field's picker/prevalue configuration. " +
    "Each item has an id and a display value. Use this to discover which data types a form field's " +
    "picker prevalue source can be pointed at. Read-only, takes no parameters.",
  inputSchema,
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetItemsApiCall<
      ReturnType<ApiClient["getPickerDataType"]>,
      ApiClient
    >((client) => client.getPickerDataType(CAPTURE_RAW_HTTP_RESPONSE));
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(ListPickerDataTypesTool);
