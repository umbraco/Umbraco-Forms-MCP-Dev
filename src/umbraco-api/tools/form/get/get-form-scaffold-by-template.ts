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
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { normalizeScaffoldDates } from "./normalize-scaffold-dates.js";
import { normalizeScaffoldReferences } from "./normalize-scaffold-references.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = getFormScaffoldByTemplateParams.shape;

/**
 * The full `FormDesign` output schema is deliberately not declared on this
 * tool. Serialized to JSON Schema it is ~20KB, and three tools return that
 * same shape — together roughly a fifth of everything this server sends in
 * `tools/list`, on every session, whether or not a form is ever touched.
 *
 * It buys very little: the design is returned in full as the tool's content,
 * so its shape is visible in the response itself. Dropping the declaration
 * changes nothing about what the tool returns.
 */
const GetFormScaffoldByTemplateTool: ToolDefinition<typeof inputSchema> = {
  name: "get-form-scaffold-by-template",
  description:
    "Gets a form design pre-populated from a named form template (e.g. 'Contact us', 'Newsletter signup') — use list-form-templates to see what is available. Edit the returned design and pass it to create-form to save it. For a form you are designing yourself rather than starting from a template, create-simple-form is quicker: it takes just a name and a list of fields. Use get-form-scaffold for a blank design with no template.",
  inputSchema,
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
