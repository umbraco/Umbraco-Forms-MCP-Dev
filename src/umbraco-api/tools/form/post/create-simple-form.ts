/**
 * Create Simple Form Tool
 *
 * Creates a single-page form from a compact field list, generating the full
 * `FormDesign` (GUIDs, pages, fieldsets, containers, boilerplate settings)
 * server-side. The fast path for the common case; `create-form` remains
 * available for designs that need conditions, workflows or multiple pages.
 */

import {
  getApiClient,
  createToolResult,
  UmbracoApiError,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
  type HttpResponse,
  type ProblemDetails,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type {
  getUmbracoFormsManagementAPI,
  FormDesign,
} from "../../../api/generated/umbracoFormsManagementApi.js";
import { withBodyDecorators } from "../../shared/body-text.js";
import {
  buildFormDesign,
  simpleFormShape,
  type SimpleFormSpec,
} from "../shared/build-form-design.js";
import { FIELD_TYPE_ALIAS_NAMES } from "../shared/form-field-types.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = simpleFormShape;

const outputSchema = z.object({
  success: z.boolean(),
  id: z.string().describe("The id of the newly created form."),
});

const CreateSimpleFormTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "create-simple-form",
  description:
    "Creates a single-page form from a name and a list of fields. Prefer this over create-form for ordinary forms: it generates every GUID, page, fieldset and boilerplate setting for you, so there is no need to call get-form-scaffold first or hand-write a form design. Each field needs only a label and a type (" +
    FIELD_TYPE_ALIAS_NAMES.join(", ") +
    "), plus optionally required, group, placeholder, helpText, options (for dropdown/radio/checkboxList), pattern, maxLength and defaultValue. Set 'group' to sort fields into captioned fieldsets. Use create-form instead when the design needs conditional logic, workflows, several pages, or a custom field type from list-field-types.",
  inputSchema,
  outputSchema,
  slices: ["create"],
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
  },
  handler: async (spec) => {
    const formDesign = buildFormDesign(spec as SimpleFormSpec);

    const client = getApiClient<ApiClient>();
    const response = (await client.postForm(
      formDesign as FormDesign,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<ProblemDetails | void>;

    if (response.status < 200 || response.status >= 300) {
      throw new UmbracoApiError(
        (response.data as ProblemDetails) || {
          status: response.status,
          detail: response.statusText,
        },
      );
    }

    return createToolResult({ success: true, id: formDesign.id });
  },
};

export default withBodyDecorators(CreateSimpleFormTool);
