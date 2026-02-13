import * as zod from "zod";
import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getFieldTypeResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const emptyInput = zod.object({});

const outputSchema = zod.object({ items: getFieldTypeResponse });

const ListFieldTypes = {
  name: "list-field-types",
  description:
    "List all available form field type definitions. Field types define what kinds of fields can be added to forms (e.g., Short Answer, Checkbox, File Upload). Each type includes its capabilities (supports prevalues, regex, mandatory) and configuration settings schema. Returns all installed field types. Use this to discover available field types when designing or modifying forms.",
  inputSchema: emptyInput.shape,
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getFieldType"]>, ApiClient>(
      (client) => client.getFieldType(CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof emptyInput.shape, typeof outputSchema>;

export default withStandardDecorators(ListFieldTypes);
