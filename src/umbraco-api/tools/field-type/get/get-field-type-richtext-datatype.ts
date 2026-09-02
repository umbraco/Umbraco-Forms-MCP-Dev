/**
 * Get Field Type Richtext Datatype Tool
 *
 * Gets the Umbraco data type (property editor) that backs the Rich Text field type
 * in Umbraco Forms, e.g. its property editor UI alias and configuration data.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getFieldTypeRichtextDatatypeResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetFieldTypeRichtextDatatypeTool = {
  name: "get-field-type-richtext-datatype",
  description:
    "Gets the underlying Umbraco data type used to render the Rich Text field type in " +
    "Umbraco Forms, including its id, key, name, property editor UI alias, and " +
    "configuration data. Use this to inspect which rich text editor and configuration " +
    "backs the Forms Rich Text field — not for retrieving general Forms field type " +
    "definitions (use list-field-types or get-field-type-by-id for those).",
  inputSchema: {},
  outputSchema: getFieldTypeRichtextDatatypeResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getFieldTypeRichtextDatatype"]>, ApiClient>(
      (client) => client.getFieldTypeRichtextDatatype(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<Record<string, never>, typeof getFieldTypeRichtextDatatypeResponse>;

export default withStandardDecorators(GetFieldTypeRichtextDatatypeTool);
