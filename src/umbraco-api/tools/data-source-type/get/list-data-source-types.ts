/**
 * List Data Source Types Tool
 *
 * Calls GET /umbraco/forms/management/api/v1/data-source-type
 */

import { z } from "zod";
import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getDataSourceTypeResponseItem } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const outputSchema = z.object({ items: z.array(getDataSourceTypeResponseItem) });

const ListDataSourceTypesTool = {
  name: "list-data-source-types",
  description:
    "Lists every data source type registered in Umbraco Forms, including the built-in types (e.g. Umbraco members, examine index, static values) and any custom types added by installed packages. Each entry includes its id, alias, name, description, icon, and the settings schema used to configure a data source of that type. Data source types are read-only entities defined by code/installed packages — they cannot be created, updated, or deleted via the API. Use this to discover which data source types are available before creating a data source, or to look up the settings a given type expects. To fetch a single type by id, use get-data-source-type-by-id instead.",
  inputSchema: {},
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getDataSourceType"]>, ApiClient>(
      (client) => client.getDataSourceType(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<Record<string, never>, typeof outputSchema>;

export default withStandardDecorators(ListDataSourceTypesTool);
