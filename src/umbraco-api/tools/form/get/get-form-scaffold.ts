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
import { getFormScaffoldResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { normalizeScaffoldDates } from "./normalize-scaffold-dates.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const outputSchema = getFormScaffoldResponse;

const GetFormScaffoldTool: ToolDefinition<undefined, typeof outputSchema> = {
  name: "get-form-scaffold",
  description:
    "Gets a blank form design template with default settings and all GUIDs already generated (form ID, page ID, etc.) — the starting point for creating a new form. Edit the name, pages and fields on the returned object, then pass the whole thing to create-form. Never invent your own GUIDs; reuse the ones in this scaffold. Use get-form-scaffold-by-template instead if you want to start from a named template (e.g. a contact form).",
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getFormScaffold"]>, ApiClient>(async (client) => {
      const response = (await client.getFormScaffold(CAPTURE_RAW_HTTP_RESPONSE)) as HttpResponse<FormDesign>;
      return normalizeScaffoldDates(response);
    });
  },
};

export default withStandardDecorators(GetFormScaffoldTool);
