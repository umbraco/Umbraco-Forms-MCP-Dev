/**
 * Create Form Tool
 *
 * Creates a new form from a form design document. The full-control counterpart
 * to `create-simple-form`: use this when the design needs conditions,
 * workflows, several pages or a custom field type.
 *
 * Only `name` and `pages` are required. Every other property of the design is
 * either a constant, a timestamp or a GUID that merely has to be unique, so it
 * is backfilled by `withFormDesignDefaults` rather than demanded from the
 * caller — which is what previously forced a `get-form-scaffold` round-trip
 * just to copy boilerplate back out.
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
import { postFormBody } from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { withBodyDecorators } from "../../shared/body-text.js";
import { withFormDesignDefaults } from "../shared/build-form-design.js";
import { makeOptional } from "../shared/optional-shape.js";
import { relaxedPagesSchema } from "../shared/form-pages-schema.js";
import { SERVER_DERIVABLE_FORM_KEYS } from "../shared/form-design-keys.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  ...makeOptional(postFormBody.shape, SERVER_DERIVABLE_FORM_KEYS),
  pages: relaxedPagesSchema,
};

const outputSchema = z.object({
  success: z.boolean(),
  id: z.string().describe("The id of the newly created form."),
});

const CreateFormTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "create-form",
  description:
    "Creates a new form from a full form design. For an ordinary single-page form, prefer create-simple-form — it takes just a name and a list of fields. Use this tool when the design needs conditional logic, workflows, multiple pages, validation rules, or a custom field type from list-field-types. Only 'name' and 'pages' are required: IDs, timestamps, paths and display defaults are generated server-side when omitted, so there is no need to call get-form-scaffold first or to echo back boilerplate. Supply a GUID for any node only when you need to control it; otherwise leave it out and one is generated. Omit optional keys entirely rather than sending null or a guessed value.",
  inputSchema,
  outputSchema,
  slices: ["create"],
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
  },
  handler: async (formDesign) => {
    const complete = withFormDesignDefaults(
      formDesign as Record<string, unknown>,
    );

    const client = getApiClient<ApiClient>();
    const response = (await client.postForm(
      complete as FormDesign,
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

    return createToolResult({ success: true, id: complete.id });
  },
};

export default withBodyDecorators(CreateFormTool);
