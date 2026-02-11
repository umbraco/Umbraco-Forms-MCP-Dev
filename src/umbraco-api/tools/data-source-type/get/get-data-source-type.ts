import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getDataSourceTypeByIdParams,
  getDataSourceTypeByIdResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetDataSourceType = {
  name: "get-data-source-type",
  description:
    "Retrieve a data source type definition by its unique ID. Returns the type template including name, description, and configurable settings schema. Use this after listing data source types to get full details including settings for a specific type before creating or configuring data source instances.",
  inputSchema: getDataSourceTypeByIdParams.shape,
  outputSchema: getDataSourceTypeByIdResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getDataSourceTypeById"]>, ApiClient>(
      (client) => client.getDataSourceTypeById(params.id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof getDataSourceTypeByIdParams.shape, typeof getDataSourceTypeByIdResponse>;

export default withStandardDecorators(GetDataSourceType);
