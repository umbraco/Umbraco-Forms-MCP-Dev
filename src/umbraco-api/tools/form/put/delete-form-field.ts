/**
 * Delete Form Field Tool
 *
 * Removes a single field from an existing form without requiring the caller
 * to reproduce the form's full design. Umbraco Forms has no field-level
 * delete endpoint — the underlying API only supports replacing the whole
 * form via PUT — so this tool fetches the current design, removes the
 * matching field server-side, and writes the rest back unchanged. This
 * avoids forcing the model to hand-type the entire multi-KB form object
 * (pages, fieldsets, workflows, settings) just to drop one field, which is
 * exactly the kind of large literal reproduction that trips up JSON
 * generation (see update-form/create-form).
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  getApiClient,
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

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  formId: z.uuid().describe("The id of the form containing the field. Use list-forms or get-form-by-id to find it."),
  fieldId: z
    .uuid()
    .describe("The id of the field to remove, from get-form-by-id's pages[].fieldSets[].containers[].fields[]."),
};

const DeleteFormFieldTool = {
  name: "delete-form-field",
  description:
    "Removes a single field from a form by id, without needing the full form design as input " +
    "or output. Fetches the current design, removes the matching field, and saves the rest of " +
    "the form unchanged. Prefer this over update-form when the only change is removing one " +
    "field — it avoids reproducing the entire form object. Fails if the field id isn't found " +
    "on the form.",
  inputSchema,
  slices: ["delete"],
  annotations: {
    destructiveHint: true,
    idempotentHint: false,
  },
  handler: async ({ formId, fieldId }) => {
    const client = getApiClient<ApiClient>();

    const existingResponse = (await client.getFormById(
      formId,
      undefined,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<FormDesign | ProblemDetails>;

    if (existingResponse.status < 200 || existingResponse.status >= 300) {
      throw new UmbracoApiError(existingResponse.data as ProblemDetails);
    }

    const existing = existingResponse.data as FormDesign;

    let found = false;
    const pages = existing.pages.map((page) => ({
      ...page,
      fieldSets: page.fieldSets.map((fieldSet) => ({
        ...fieldSet,
        containers: fieldSet.containers.map((container) => {
          const fields = container.fields.filter((field) => {
            if (field.id !== fieldId) return true;
            found = true;
            return false;
          });
          return { ...container, fields };
        }),
      })),
    }));

    if (!found) {
      throw new UmbracoApiError({
        status: 404,
        title: "Field not found",
        detail: `No field with id "${fieldId}" was found on form "${formId}".`,
      });
    }

    const payload: FormDesign = { ...existing, pages };

    return executeVoidApiCall<ApiClient>((client) =>
      client.putFormById(formId, payload, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(DeleteFormFieldTool);
