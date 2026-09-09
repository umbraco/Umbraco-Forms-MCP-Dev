/**
 * Get Form Scaffold By Template Tool
 *
 * Returns a ready-to-edit form design pre-populated from a named form
 * template (e.g. "Contact us"), with all required IDs already generated.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type HttpResponse,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type {
  FormDesign,
  getUmbracoFormsManagementAPI,
} from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormScaffoldByTemplateParams,
  getFormScaffoldByTemplateResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { normalizeScaffoldDates } from "./normalize-scaffold-dates.js";
import { normalizeScaffoldReferences } from "./normalize-scaffold-references.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = getFormScaffoldByTemplateParams.shape;
const outputSchema = getFormScaffoldByTemplateResponse;

const GetFormScaffoldByTemplateTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-form-scaffold-by-template",
  description:
    "Gets a pre-populated form design based on a named form template (e.g. 'Contact us', 'Newsletter signup') with all GUIDs already generated. Edit the returned design as needed, then pass it to create-form. Never invent your own GUIDs; reuse the ones in this scaffold. Use get-form-scaffold instead for a blank form with no template.",
  inputSchema,
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ template }) => {
    return executeGetApiCall<
      ReturnType<ApiClient["getFormScaffoldByTemplate"]>,
      ApiClient
    >(async (client) => {
      const response = (await client.getFormScaffoldByTemplate(
        template,
        CAPTURE_RAW_HTTP_RESPONSE,
      )) as HttpResponse<FormDesign>;
      return normalizeScaffoldReferences(normalizeScaffoldDates(response));
    });
  },
};

export default withStandardDecorators(GetFormScaffoldByTemplateTool);
