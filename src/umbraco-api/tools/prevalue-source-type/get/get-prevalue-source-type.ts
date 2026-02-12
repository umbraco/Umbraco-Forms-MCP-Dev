import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getPrevalueSourceTypeByIdParams,
  getPrevalueSourceTypeByIdResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetPrevalueSourceType = {
  name: "get-prevalue-source-type",
  description:
    "Retrieve a specific prevalue source type definition by its unique ID. Returns full details including name, description, and configurable settings schema. Use this after listing prevalue source types to get full details for a specific type before creating or configuring prevalue source instances.",
  inputSchema: getPrevalueSourceTypeByIdParams.shape,
  outputSchema: getPrevalueSourceTypeByIdResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getPrevalueSourceTypeById"]>, ApiClient>(
      (client) => client.getPrevalueSourceTypeById(params.id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof getPrevalueSourceTypeByIdParams.shape, typeof getPrevalueSourceTypeByIdResponse>;

export default withStandardDecorators(GetPrevalueSourceType);
