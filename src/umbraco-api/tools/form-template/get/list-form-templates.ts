/**
 * List Form Templates Tool
 *
 * Lists the form templates available in Umbraco Forms that can be used to scaffold
 * new forms with a pre-defined set of pages, fieldsets, and fields.
 */

import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getFormTemplateResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const outputSchema = z.object({ items: getFormTemplateResponse });

const ListFormTemplatesTool = {
  name: "list-form-templates",
  description:
    "Lists the form templates available in Umbraco Forms, each with its alias, unique id, " +
    "entity type, name, and description. Form templates are pre-built starting points " +
    "(e.g. Contact Us, Feedback, Registration) that pre-populate a new form's pages, " +
    "fieldsets, and fields when scaffolding a form from a template. Use this to discover " +
    "which template aliases/ids are available before creating a form based on a template. " +
    "Does not return the full template layout/content, and does not create, edit, or delete " +
    "templates — templates are fixed, built-in definitions.",
  inputSchema: {},
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getFormTemplate"]>, ApiClient>((client) =>
      client.getFormTemplate(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<Record<string, never>, typeof outputSchema>;

export default withStandardDecorators(ListFormTemplatesTool);
