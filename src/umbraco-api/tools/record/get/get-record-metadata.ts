import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormByFormIdRecordMetadataParams,
  getFormByFormIdRecordMetadataResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetRecordMetadataTool = {
  name: "get-record-metadata",
  description:
    "Get summary metadata for a form's records including total count and last submission date. Useful for quickly checking how many submissions a form has received without retrieving all records. Use list-forms first to find form IDs.",
  inputSchema: getFormByFormIdRecordMetadataParams.shape,
  outputSchema: getFormByFormIdRecordMetadataResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getFormByFormIdRecordMetadata"]>, ApiClient>(
      (client) => client.getFormByFormIdRecordMetadata(params.formId, undefined, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof getFormByFormIdRecordMetadataParams.shape, typeof getFormByFormIdRecordMetadataResponse>;

export default withStandardDecorators(GetRecordMetadataTool);
