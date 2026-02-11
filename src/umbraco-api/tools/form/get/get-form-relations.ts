import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormByIdRelationsParams,
  getFormByIdRelationsResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetFormRelations = {
  name: "get-form-relations",
  description:
    "Get content relations for a form by its ID. Returns a list of Umbraco content pages that reference or use this form, including node names, types, and whether they are published. Use this to check where a form is used before modifying or deleting it.",
  inputSchema: getFormByIdRelationsParams.shape,
  outputSchema: getFormByIdRelationsResponse,
  slices: ["references"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetApiCall<
      ReturnType<ApiClient["getFormByIdRelations"]>,
      ApiClient
    >((client) => client.getFormByIdRelations(params.id, CAPTURE_RAW_HTTP_RESPONSE));
  },
} satisfies ToolDefinition<
  typeof getFormByIdRelationsParams.shape,
  typeof getFormByIdRelationsResponse
>;

export default withStandardDecorators(GetFormRelations);
