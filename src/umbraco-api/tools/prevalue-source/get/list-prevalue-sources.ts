import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getPrevalueSourceQueryParams,
  getPrevalueSourceResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const ListPrevalueSources = {
  name: "list-prevalue-sources",
  description:
    "List all prevalue sources with optional pagination. Returns an array of prevalue sources with their names, types, settings, cache configuration, and validity status. Use this to discover available prevalue sources before working with a specific one.",
  inputSchema: getPrevalueSourceQueryParams.shape,
  outputSchema: getPrevalueSourceResponse,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getPrevalueSource"]>, ApiClient>(
      (client) => client.getPrevalueSource(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof getPrevalueSourceQueryParams.shape, typeof getPrevalueSourceResponse>;

export default withStandardDecorators(ListPrevalueSources);
