/**
 * Get Prevalue Source Values Tool
 *
 * Resolves and returns the actual list of prevalue options (id, value,
 * caption, sort order) that a prevalue source currently produces. Optionally
 * scoped to a specific form/field, for providers whose output depends on
 * that context (e.g. filtering by the current form). Use this to preview
 * what a field using this source will actually show to end users.
 */

import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getPrevalueSourceByIdValuesResponseItem } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: z.uuid().describe("ID of the prevalue source to resolve values for."),
  formId: z.uuid().optional().describe("Optional form ID to scope resolution to, for providers whose output depends on the form context."),
  fieldId: z.uuid().optional().describe("Optional field ID to scope resolution to, for providers whose output depends on the field context."),
};

const outputSchema = z.object({ items: z.array(getPrevalueSourceByIdValuesResponseItem) });

const getPrevalueSourceValuesTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-prevalue-source-values",
  description:
    "Resolves and returns the actual dropdown/list options (id, value, caption, sort order) " +
    "that a prevalue source currently produces. Pass formId/fieldId for providers whose " +
    "output depends on that context. Use this to preview what end users will see, not to " +
    "edit the source's configuration.",
  inputSchema,
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id, formId, fieldId }) => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getPrevalueSourceByIdValues"]>, ApiClient>(
      (client) => client.getPrevalueSourceByIdValues(id, { formId, fieldId }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(getPrevalueSourceValuesTool);
