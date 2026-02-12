import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getPrevalueSourceByIdParams,
  getPrevalueSourceByIdResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetPrevalueSource = {
  name: "get-prevalue-source",
  description:
    "Retrieve a prevalue source by its unique ID. Returns the prevalue source configuration including name, settings, type, cache duration, and validity status. Use this when you need details about a specific prevalue source.",
  inputSchema: getPrevalueSourceByIdParams.shape,
  outputSchema: getPrevalueSourceByIdResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getPrevalueSourceById"]>, ApiClient>(
      (client) => client.getPrevalueSourceById(params.id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof getPrevalueSourceByIdParams.shape, typeof getPrevalueSourceByIdResponse>;

export default withStandardDecorators(GetPrevalueSource);
