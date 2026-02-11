import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormByIdParams,
  getFormByIdResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetFormTool = {
  name: "get-form",
  description:
    "Retrieves the full form design by ID including all pages, fieldsets, fields, validation rules, workflows, and configuration. Returns everything needed to understand a form's structure. Use list-forms first to find form IDs.",
  inputSchema: getFormByIdParams.shape,
  outputSchema: getFormByIdResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getFormById"]>, ApiClient>(
      (client) => client.getFormById(params.id, undefined, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof getFormByIdParams.shape, typeof getFormByIdResponse>;

export default withStandardDecorators(GetFormTool);
