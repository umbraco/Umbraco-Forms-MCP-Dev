/**
 * List Prevalue Source Types Tool
 *
 * Lists every prevalue source type built into Umbraco Forms (e.g. Static Values,
 * Values from a Sheet, Values from a Member Property Editor, Umbraco content nodes)
 * together with their configurable settings.
 */

import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getPrevalueSourceTypeResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const outputSchema = z.object({ items: getPrevalueSourceTypeResponse });

const ListPrevalueSourceTypesTool = {
  name: "list-prevalue-source-types",
  description:
    "Lists every prevalue source type built into Umbraco Forms, including its id, " +
    "unique id, entity type, alias, name, description, icon, and available settings. " +
    "Prevalue source types are fixed system definitions (e.g. Static Values, Values " +
    "from a Sheet, Values from a Member Property Editor, Umbraco content nodes) that " +
    "describe where a prevalue source (used to populate dropdowns/checkboxes/radio " +
    "buttons on a form) gets its values from — they are not created or edited by " +
    "users. Use this to discover which prevalue source type ids/aliases are available " +
    "and what settings each one supports before creating or configuring a prevalue " +
    "source. To look up a single known type by id, use get-prevalue-source-type-by-id " +
    "instead.",
  inputSchema: {},
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getPrevalueSourceType"]>, ApiClient>(
      (client) => client.getPrevalueSourceType(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<Record<string, never>, typeof outputSchema>;

export default withStandardDecorators(ListPrevalueSourceTypesTool);
