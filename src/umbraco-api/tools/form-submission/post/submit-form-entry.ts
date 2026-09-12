import * as zod from "zod";
import {
  withStandardDecorators,
  createToolResult,
  createToolResultError,
  ToolDefinition,
  HttpResponse,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsDeliveryAPI } from "../../../api/generated/umbracoFormsDeliveryApi.js";

const inputSchema = {
  formId: zod.string().uuid().describe("The form ID to submit an entry for. Use list-forms to find form IDs."),
  values: zod.record(zod.string(), zod.union([zod.string(), zod.array(zod.string())])).describe("Field values keyed by field alias. Use get-form-definition to discover field aliases. Values can be a single string or an array of strings for multi-value fields."),
  culture: zod.string().optional().describe("Culture code for localized forms (e.g., 'en-US')"),
};

const outputSchema = zod.object({
  success: zod.boolean(),
  formId: zod.string(),
});

const SubmitFormEntryTool = {
  name: "submit-form-entry",
  description:
    "Submit a form entry via the Delivery API, creating a new form submission record. Use get-form-definition first to discover field aliases and required fields. Values must be keyed by field alias (not field ID). Requires the Forms Delivery API to be enabled on the Umbraco instance.",
  inputSchema,
  outputSchema,
  slices: ["create"],
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
  },
  handler: async (params) => {
    // Normalize values: wrap single strings in arrays for the API
    const normalizedValues: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(params.values)) {
      normalizedValues[key] = Array.isArray(value) ? value : [value];
    }

    const response = (await getUmbracoFormsDeliveryAPI().postUmbracoFormsDeliveryApiV1EntriesId(
      params.formId,
      {
        values: normalizedValues,
        ...(params.culture ? { culture: params.culture } : {}),
      },
      { returnFullResponse: true }
    )) as HttpResponse<void>;

    if (response.status >= 400) {
      return createToolResultError({
        error: `Form submission failed with status ${response.status}`,
      });
    }

    return createToolResult({
      success: true,
      formId: params.formId,
    });
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(SubmitFormEntryTool);
