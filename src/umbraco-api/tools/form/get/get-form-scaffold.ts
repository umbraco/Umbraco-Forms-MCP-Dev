/**
 * Get Form Scaffold Tool
 *
 * Returns a blank, ready-to-edit form design with all required IDs already
 * generated — the recommended starting point for creating a new form.
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
import { normalizeScaffoldDates } from "./normalize-scaffold-dates.js";
import { normalizeScaffoldReferences } from "./normalize-scaffold-references.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;


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
const GetFormScaffoldTool: ToolDefinition<undefined> = {
  name: "get-form-scaffold",
  description:
    "Gets a blank form design with Umbraco's default settings filled in. You rarely need this: to create a form, call create-simple-form with a name and a list of fields, or create-form for a design needing conditions, workflows or multiple pages — both generate any GUIDs you leave out. Reach for this scaffold when you specifically want to see the defaults Umbraco applies before changing them. Use get-form-scaffold-by-template to start from a named template instead.",
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getFormScaffold"]>, ApiClient>(async (client) => {
      const response = (await client.getFormScaffold(CAPTURE_RAW_HTTP_RESPONSE)) as HttpResponse<FormDesign>;
      return normalizeScaffoldReferences(normalizeScaffoldDates(response));
    });
  },
};

export default withStandardDecorators(GetFormScaffoldTool);
