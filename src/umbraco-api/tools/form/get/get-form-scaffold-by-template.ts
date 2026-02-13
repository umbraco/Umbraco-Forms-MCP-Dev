import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormScaffoldByTemplateParams,
  getFormScaffoldByTemplateResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetFormScaffoldByTemplate = {
  name: "get-form-scaffold-by-template",
  description:
    "Gets a form scaffold pre-populated from a named template. Returns a full form structure with fields, pages, and settings configured by the template. Use this instead of get-form-scaffold when you want to start from a template rather than a blank form. Use list-form-templates to discover available template names.",
  inputSchema: getFormScaffoldByTemplateParams.shape,
  outputSchema: getFormScaffoldByTemplateResponse,
  slices: ["scaffolding"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getFormScaffoldByTemplate"]>, ApiClient>(
      (client) => client.getFormScaffoldByTemplate(params.template, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof getFormScaffoldByTemplateParams.shape, typeof getFormScaffoldByTemplateResponse>;

export default withStandardDecorators(GetFormScaffoldByTemplate);
