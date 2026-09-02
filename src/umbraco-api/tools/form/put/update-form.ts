/**
 * Update Form Tool
 *
 * Replaces an existing form's entire design (name, pages, fields, workflows,
 * settings). Fetch the current design with get-form-by-id first, edit only
 * what needs to change, and submit the full object back — this is a full
 * replace, not a partial patch.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type {
  getUmbracoFormsManagementAPI,
  FormDesign,
} from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  putFormByIdParams,
  putFormByIdBody,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  ...putFormByIdParams.shape,
  ...putFormByIdBody.shape,
};

const UpdateFormTool: ToolDefinition<typeof inputSchema> = {
  name: "update-form",
  description:
    "Replaces an existing form's entire design — this is a full replace, not a partial patch. Always call get-form-by-id first, change only the fields/pages/settings you need, and pass the resulting object (including its unchanged id and unique values) back here. Do not invent GUIDs for any new pages/fields you add; reuse existing ones from the fetched design for anything you keep. Any field that is null in the fetched design (e.g. autocompleteAttribute, cssClass, tooltip, dataSourceFieldKey, folderId) is optional — omit it entirely rather than retyping it as null; only required fields and the ones you're actually changing need to be present.",
  inputSchema,
  slices: ["update"],
  annotations: {
    idempotentHint: true,
  },
  handler: async (formDesign) => {
    // The form's own "id" is both the path segment and a required field
    // inside the FormDesign body — keep it in both places rather than
    // stripping it out.
    return executeVoidApiCall<ApiClient>((client) =>
      client.putFormById(formDesign.id, formDesign as FormDesign, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(UpdateFormTool);
