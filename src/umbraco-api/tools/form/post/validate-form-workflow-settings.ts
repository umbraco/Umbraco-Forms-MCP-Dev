/**
 * Validate Form Workflow Settings Tool
 *
 * Validates a workflow's settings against its workflow type's rules before
 * saving, without persisting anything.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  postFormWorkflowByIdValidateSettingsParams,
  postFormWorkflowByIdValidateSettingsBody,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  ...postFormWorkflowByIdValidateSettingsParams.shape,
  ...postFormWorkflowByIdValidateSettingsBody.shape,
};

// Response shape is not documented as a fixed object by the API (validation
// result payload varies by workflow type), so outputSchema is intentionally
// omitted rather than guessing at a shape.
const ValidateFormWorkflowSettingsTool: ToolDefinition<typeof inputSchema> = {
  name: "validate-form-workflow-settings",
  description:
    "Validates a form workflow's proposed settings (name, settings map) against its workflow type (id) without saving anything. Use this to check a workflow configuration before including it in create-form or update-form. Returns any validation errors found.",
  inputSchema,
  slices: ["validate"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id, name, settings }) => {
    return executeGetApiCall<
      ReturnType<ApiClient["postFormWorkflowByIdValidateSettings"]>,
      ApiClient
    >((client) =>
      client.postFormWorkflowByIdValidateSettings(
        id,
        { name, settings },
        CAPTURE_RAW_HTTP_RESPONSE,
      ),
    );
  },
};

export default withStandardDecorators(ValidateFormWorkflowSettingsTool);
