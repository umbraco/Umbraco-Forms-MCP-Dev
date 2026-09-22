/**
 * Get Form By ID Tool
 *
 * Fetches the full form design (pages, fields, workflows, settings) for a single form.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormByIdParams,
  getFormByIdQueryParams,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  ...getFormByIdParams.shape,
  ...getFormByIdQueryParams.shape,
};


/**
 * The full `FormDesign` output schema is deliberately not declared on this
 * tool. Serialized to JSON Schema it is ~20KB, and three tools return that
 * same shape — together roughly a fifth of everything this server sends in
 * `tools/list`, on every session, whether or not a form is ever touched.
 *
 * It buys very little: the design is returned in full as the tool's content,
 * so its shape is visible in the response itself. Dropping the declaration
 * changes nothing about what the tool returns.
 */
const GetFormByIdTool: ToolDefinition<typeof inputSchema> = {
  name: "get-form-by-id",
  description:
    "Gets the complete form design for a single Umbraco Forms form by its ID, including its pages, fieldsets, fields, workflows and validation rules. Set applyDictionaryTranslations to true to resolve any dictionary keys used in labels/messages into their translated text. Use this before update-form so the full design (with existing GUIDs) can be edited and sent back unchanged except for the intended modifications.",
  inputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id, applyDictionaryTranslations }) => {
    return executeGetApiCall<ReturnType<ApiClient["getFormById"]>, ApiClient>(
      (client) =>
        client.getFormById(
          id,
          { applyDictionaryTranslations },
          CAPTURE_RAW_HTTP_RESPONSE,
        ),
    );
  },
};

export default withStandardDecorators(GetFormByIdTool);
