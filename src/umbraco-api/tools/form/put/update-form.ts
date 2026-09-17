/**
 * Update Form Tool
 *
 * Replaces an existing form's entire design. Fetch the current design with
 * get-form-by-id first, edit what needs to change, and submit it back — this is
 * a full replace, not a partial patch.
 *
 * As with create-form, the properties that carry no design decision are
 * optional and backfilled. `id` stays required (it is also the path segment)
 * and so does `pages`, because a full replace with `pages` omitted would
 * silently empty the form.
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
import {
  putFormByIdParams,
  putFormByIdBody,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { withBodyDecorators } from "../../shared/body-text.js";
import { withFormDesignDefaults } from "../../shared/build-form-design.js";
import { makeOptional } from "../../shared/optional-shape.js";
import { relaxedPagesSchema } from "../../shared/form-pages-schema.js";
import { SERVER_DERIVABLE_FORM_KEYS } from "../../shared/form-design-keys.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

/**
 * `id` identifies which form is being replaced, so unlike create-form it must
 * stay required here even though it is otherwise server-derivable.
 */
const RELAXABLE_KEYS = SERVER_DERIVABLE_FORM_KEYS.filter(
  (key) => key !== "id",
) as Exclude<(typeof SERVER_DERIVABLE_FORM_KEYS)[number], "id">[];

const inputSchema = {
  ...putFormByIdParams.shape,
  ...makeOptional(putFormByIdBody.shape, RELAXABLE_KEYS),
  pages: relaxedPagesSchema,
};

const UpdateFormTool: ToolDefinition<typeof inputSchema> = {
  name: "update-form",
  description:
    "Replaces an existing form's entire design — a full replace, not a partial patch. Call get-form-by-id first, change only what you need, and send the result back including its 'id' and the complete 'pages' array (omitting pages would empty the form). Reuse the existing GUIDs for anything you keep; leave the GUID out for a page or field you are adding and one is generated. Properties that carry no design decision — timestamps, path, nodeId, display defaults — are optional and filled in server-side, so you do not need to echo them back. To add fields to a form without restating the whole design, use add-form-fields instead.",
  inputSchema,
  slices: ["update"],
  annotations: {
    idempotentHint: true,
  },
  handler: async (formDesign) => {
    const complete = withFormDesignDefaults(
      formDesign as Record<string, unknown>,
    );

    // The form's own `id` is both the path segment and a required property of
    // the body — keep it in both places rather than stripping it out.
    return executeVoidApiCall<ApiClient>((client) =>
      client.putFormById(
        formDesign.id,
        complete as FormDesign,
        CAPTURE_RAW_HTTP_RESPONSE,
      ),
    );
  },
};

export default withBodyDecorators(UpdateFormTool);
