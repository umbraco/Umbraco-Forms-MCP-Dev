import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getWorkflowTypeByIdParams,
  getWorkflowTypeByIdResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetWorkflowType = {
  name: "get-workflow-type",
  description:
    "Retrieve a specific workflow type definition by its unique ID. Returns full details including name, description, group, and configurable settings schema. Use this after listing workflow types to get full details for a specific type before configuring form workflows.",
  inputSchema: getWorkflowTypeByIdParams.shape,
  outputSchema: getWorkflowTypeByIdResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getWorkflowTypeById"]>, ApiClient>(
      (client) => client.getWorkflowTypeById(params.id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof getWorkflowTypeByIdParams.shape, typeof getWorkflowTypeByIdResponse>;

export default withStandardDecorators(GetWorkflowType);
