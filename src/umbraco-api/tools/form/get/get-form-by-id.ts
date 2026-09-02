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
  getFormByIdResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  ...getFormByIdParams.shape,
  ...getFormByIdQueryParams.shape,
};

const outputSchema = getFormByIdResponse;

const GetFormByIdTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-form-by-id",
  description:
    "Gets the complete form design for a single Umbraco Forms form by its ID, including its pages, fieldsets, fields, workflows and validation rules. Set applyDictionaryTranslations to true to resolve any dictionary keys used in labels/messages into their translated text. Use this before update-form so the full design (with existing GUIDs) can be edited and sent back unchanged except for the intended modifications.",
  inputSchema,
  outputSchema,
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
