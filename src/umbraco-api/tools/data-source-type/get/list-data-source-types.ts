import * as zod from "zod";
import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const emptyInput = zod.object({});

// Relaxed schema: API returns non-UUID IDs for some built-in data source types
const dataSourceTypeItem = zod.object({
  id: zod.string(),
  unique: zod.string(),
  entityType: zod.string(),
  alias: zod.string(),
  name: zod.string(),
  description: zod.string(),
  icon: zod.string(),
  settings: zod.array(zod.object({
    name: zod.string(),
    alias: zod.string(),
    description: zod.string(),
    prevalues: zod.array(zod.string()),
    view: zod.string(),
    displayOrder: zod.number(),
    defaultValue: zod.string(),
    isReadOnly: zod.boolean(),
    isMandatory: zod.boolean(),
  })),
});

const outputSchema = zod.object({ items: zod.array(dataSourceTypeItem) });

const ListDataSourceTypes = {
  name: "list-data-source-types",
  description:
    "List all available data source type definitions. Data source types are templates that define what kinds of data sources can be created (e.g., SQL database, Umbraco content picker). Each type includes its configuration settings schema. Returns all available types (typically a small set of system-defined types). Use this to discover what types are available before creating a data source instance.",
  inputSchema: emptyInput.shape,
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getDataSourceType"]>, ApiClient>(
      (client) => client.getDataSourceType(CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof emptyInput.shape, typeof outputSchema>;

export default withStandardDecorators(ListDataSourceTypes);
