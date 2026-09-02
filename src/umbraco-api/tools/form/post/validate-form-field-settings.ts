/**
 * Validate Form Field Settings Tool
 *
 * Validates a field's settings against its field type's rules before saving,
 * without persisting anything.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  postFormFieldByIdValidateSettingsParams,
  postFormFieldByIdValidateSettingsBody,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  ...postFormFieldByIdValidateSettingsParams.shape,
  ...postFormFieldByIdValidateSettingsBody.shape,
};

// Response shape is not documented as a fixed object by the API (validation
// result payload varies by field type), so outputSchema is intentionally
// omitted rather than guessing at a shape.
const ValidateFormFieldSettingsTool: ToolDefinition<typeof inputSchema> = {
  name: "validate-form-field-settings",
  description:
    "Validates a form field's proposed settings (caption, alias, settings map, allowed upload types) against its field type (id) without saving anything. Use this to check a field configuration before including it in create-form or update-form. Returns any validation errors found.",
  inputSchema,
  slices: ["validate"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id, caption, alias, settings, allowedUploadTypes }) => {
    return executeGetApiCall<
      ReturnType<ApiClient["postFormFieldByIdValidateSettings"]>,
      ApiClient
    >((client) =>
      client.postFormFieldByIdValidateSettings(
        id,
        { caption, alias, settings, allowedUploadTypes },
        CAPTURE_RAW_HTTP_RESPONSE,
      ),
    );
  },
};

export default withStandardDecorators(ValidateFormFieldSettingsTool);
