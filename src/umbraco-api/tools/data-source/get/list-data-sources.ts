import { z } from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getDataSourceQueryParams,
  getDataSourceResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

// Relax formDataSourceTypeId from uuid() to string() in items — the API can return non-UUID type IDs
const itemSchema = getDataSourceResponse.shape.items.element.extend({
  formDataSourceTypeId: z.string(),
});
const outputSchema = getDataSourceResponse.extend({
  items: z.array(itemSchema),
});

const ListDataSources = {
  name: "list-data-sources",
  description:
    "List all form data sources with optional pagination. Returns an array of data sources with their names, types, settings, and validity status. Use this to discover available data sources before working with a specific one.",
  inputSchema: getDataSourceQueryParams.shape,
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getDataSource"]>, ApiClient>(
      (client) => client.getDataSource(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof getDataSourceQueryParams.shape, typeof outputSchema>;

export default withStandardDecorators(ListDataSources);
