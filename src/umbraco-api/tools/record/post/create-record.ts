/**
 * Create Record Tool
 *
 * Adds a form entry (record) through the Management API, as an editor would in the backoffice.
 */

import {
  withStandardDecorators,
  getApiClient,
  createToolResult,
  UmbracoApiError,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
  type HttpResponse,
  type ProblemDetails,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  postFormByFormIdRecordParams,
  putFormByFormIdRecordByRecordIdBodyItem,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { withFormsFeature } from "../../shared/forms-version.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  formId: postFormByFormIdRecordParams.shape.formId.describe("ID of the form to add the entry to."),
  fields: z
    .array(putFormByFormIdRecordByRecordIdBodyItem)
    .describe(
      "Field values for the new entry. Each item is { fieldId, values }: the form field's ID (from get-form-by-id " +
        "or the schema search-records returns) and an array of value(s) - a single-value field still uses a " +
        "one-element array.",
    ),
};

const outputSchema = z.object({
  success: z.boolean(),
  id: z.string().describe("ID of the new record."),
});

const CreateRecordTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "create-record",
  description:
    "Adds an entry (record) to a form as a backoffice editor would, keyed by field ID. Each given value is " +
    "validated against its field; on failure the error lists the problems per field ID. Field IDs that are not " +
    "on the form are ignored, and fields left out are stored empty. The record is stored with " +
    "state Submitted, but the form's workflows are not run - use submit-form-entry (Delivery API) for a submission " +
    "that behaves like a site visitor's. Requires permission to edit entries.",
  inputSchema,
  outputSchema,
  slices: ["create"],
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
  },
  handler: async ({ formId, fields }) => {
    const client = getApiClient<ApiClient>();
    const response = (await client.postFormByFormIdRecord(
      formId,
      fields,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as unknown as HttpResponse<{ id?: string } | ProblemDetails>;

    if (response.status < 200 || response.status >= 300) {
      throw new UmbracoApiError(
        (response.data as ProblemDetails) || { status: response.status, detail: response.statusText },
      );
    }

    // The spec declares no body, but the server answers 201 with { id }.
    const id = (response.data as { id?: string } | undefined)?.id;
    if (!id) {
      throw new UmbracoApiError({
        status: response.status,
        detail: "The record was created but the response did not include its ID.",
      });
    }

    return createToolResult({ success: true, id });
  },
};

export default withStandardDecorators(withFormsFeature("recordWrite", CreateRecordTool));
