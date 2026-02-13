import * as zod from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = zod.object({
  id: zod.string().describe("The unique identifier of the data source type"),
});

// Relaxed schema: API returns non-UUID IDs for some built-in data source types
const outputSchema = zod.object({
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

const GetDataSourceType = {
  name: "get-data-source-type",
  description:
    "Retrieve a data source type definition by its unique ID. Returns the type template including name, description, and configurable settings schema. Use this after listing data source types to get full details including settings for a specific type before creating or configuring data source instances.",
  inputSchema: inputSchema.shape,
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getDataSourceTypeById"]>, ApiClient>(
      (client) => client.getDataSourceTypeById(params.id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof inputSchema.shape, typeof outputSchema>;

export default withStandardDecorators(GetDataSourceType);
