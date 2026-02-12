import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getTreePrevalueSourceRootResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetPrevalueSourceTree = {
  name: "get-prevalue-source-tree",
  description:
    "Get the prevalue source tree showing all prevalue sources in a hierarchical structure. Returns root-level items with names, IDs, and folder structure.",
  inputSchema: {},
  outputSchema: getTreePrevalueSourceRootResponse,
  slices: ["tree"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getTreePrevalueSourceRoot"]>, ApiClient>(
      (client) => client.getTreePrevalueSourceRoot(CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<{}, typeof getTreePrevalueSourceRootResponse>;

export default withStandardDecorators(GetPrevalueSourceTree);
