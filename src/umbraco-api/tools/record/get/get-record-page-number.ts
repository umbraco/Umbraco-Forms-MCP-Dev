import * as zod from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormByFormIdRecordPageNumberResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  formId: zod.string().uuid().describe("The form ID"),
  recordId: zod.string().uuid().describe("The record ID to find the page number for"),
  take: zod.number().optional().describe("Page size used for page number calculation"),
};

const GetRecordPageNumberTool = {
  name: "get-record-page-number",
  description:
    "Get the page number where a specific record appears in a paginated record listing. Useful for navigating directly to a record's position. Use list-records first to find record IDs.",
  inputSchema,
  outputSchema: getFormByFormIdRecordPageNumberResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    const { formId, ...queryParams } = params;
    return executeGetApiCall<ReturnType<ApiClient["getFormByFormIdRecordPageNumber"]>, ApiClient>(
      (client) => client.getFormByFormIdRecordPageNumber(formId, queryParams, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof getFormByFormIdRecordPageNumberResponse>;

export default withStandardDecorators(GetRecordPageNumberTool);
