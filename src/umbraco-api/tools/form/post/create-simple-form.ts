/**
 * Create Simple Form Tool
 *
 * Creates a single-page form from a compact field list, generating the full
 * `FormDesign` (GUIDs, pages, fieldsets, containers, boilerplate settings)
 * server-side. The fast path for the common case; `create-form` remains
 * available for designs that need conditions, workflows or multiple pages.
 */

import {
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type {
  getUmbracoFormsManagementAPI,
  FormDesign,
} from "../../../api/generated/umbracoFormsManagementApi.js";
import { withBodyDecorators } from "../../shared/body-text.js";
import {
  buildFormDesign,
  simpleFormShape,
  type SimpleFormSpec,
} from "../../shared/build-form-design.js";
import { FIELD_TYPE_ALIAS_NAMES } from "../../shared/form-field-types.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = simpleFormShape;

const CreateSimpleFormTool: ToolDefinition<typeof inputSchema> = {
  name: "create-simple-form",
  description:
    "Creates a single-page form from a name and a list of fields. Prefer this over create-form for ordinary forms: it generates every GUID, page, fieldset and boilerplate setting for you, so there is no need to call get-form-scaffold first or hand-write a form design. Each field needs only a label and a type (" +
    FIELD_TYPE_ALIAS_NAMES.join(", ") +
    "), plus optionally required, group, placeholder, helpText, options (for dropdown/radio/checkboxList), pattern, maxLength and defaultValue. Set 'group' to sort fields into captioned fieldsets. Use create-form instead when the design needs conditional logic, workflows, several pages, or a custom field type from list-field-types.",
  inputSchema,
  slices: ["create"],
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
  },
  handler: async (spec) => {
    const formDesign = buildFormDesign(spec as SimpleFormSpec);

    return executeVoidApiCall<ApiClient>((client) =>
      client.postForm(formDesign as FormDesign, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withBodyDecorators(CreateSimpleFormTool);
