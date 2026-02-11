import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getDataSourceByIdParams,
  getDataSourceByIdResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetDataSource = {
  name: "get-data-source",
  description:
    "Retrieve a form data source by its unique ID. Returns the data source configuration including name, settings, type, and validity status. Use this when you need details about a specific data source.",
  inputSchema: getDataSourceByIdParams.shape,
  outputSchema: getDataSourceByIdResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getDataSourceById"]>, ApiClient>(
      (client) => client.getDataSourceById(params.id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof getDataSourceByIdParams.shape, typeof getDataSourceByIdResponse>;

export default withStandardDecorators(GetDataSource);
