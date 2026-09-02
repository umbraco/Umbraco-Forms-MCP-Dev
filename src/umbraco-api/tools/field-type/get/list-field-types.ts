/**
 * List Field Types Tool
 *
 * Lists all field types built into Umbraco Forms (e.g. Short Answer, Long Answer,
 * Checkbox, Dropdown, Date Picker, File Upload, Rich Text) together with their
 * configurable settings.
 */

import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getFieldTypeResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const outputSchema = z.object({ items: getFieldTypeResponse });

const ListFieldTypesTool = {
  name: "list-field-types",
  description:
    "Lists every field type built into Umbraco Forms, including its id, alias, name, " +
    "icon, group, and available settings/configuration options. Field types are fixed " +
    "system definitions (Short Answer, Long Answer, Checkbox, Dropdown, Date Picker, " +
    "File Upload, Rich Text, etc.) — they are not created or edited by users. Use this " +
    "to discover which field type ids/aliases are available and what settings each one " +
    "supports before configuring a form field.",
  inputSchema: {},
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getFieldType"]>, ApiClient>((client) =>
      client.getFieldType(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<Record<string, never>, typeof outputSchema>;

export default withStandardDecorators(ListFieldTypesTool);
