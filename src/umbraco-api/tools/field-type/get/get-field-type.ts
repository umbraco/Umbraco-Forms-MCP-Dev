import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFieldTypeByIdParams,
  getFieldTypeByIdResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetFieldType = {
  name: "get-field-type",
  description:
    "Retrieve a specific form field type definition by its unique ID. Returns full details including the type's capabilities, settings schema, and configuration status. Use this after listing field types to get complete details for a specific type when configuring form fields.",
  inputSchema: getFieldTypeByIdParams.shape,
  outputSchema: getFieldTypeByIdResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getFieldTypeById"]>, ApiClient>(
      (client) => client.getFieldTypeById(params.id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof getFieldTypeByIdParams.shape, typeof getFieldTypeByIdResponse>;

export default withStandardDecorators(GetFieldType);
