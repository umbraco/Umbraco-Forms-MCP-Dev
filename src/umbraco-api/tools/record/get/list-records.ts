import * as zod from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormByFormIdRecordResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  formId: zod.string().uuid().describe("The form ID to list records for. Use list-forms to find form IDs."),
  skip: zod.number().optional().describe("Number of records to skip for pagination"),
  take: zod.number().optional().describe("Number of records to return (default varies by server)"),
  filter: zod.string().optional().describe("Search filter text to match against record field values"),
  states: zod.array(zod.enum(["Opened", "Resumed", "PartiallySubmitted", "Submitted", "Approved", "Deleted", "Rejected"])).optional().describe("Filter by record states. Common values: 'Submitted', 'Approved', 'Rejected'"),
  sortBy: zod.string().optional().describe("Field alias to sort by"),
  sortOrder: zod.enum(["Ascending", "Descending"]).optional().describe("Sort direction"),
};

const ListRecordsTool = {
  name: "list-records",
  description:
    "List form submission records for a specific form with optional filtering, sorting, and pagination. Returns records with their field values, state, and schema information. Use list-forms first to find form IDs. Results include a schema array describing the form fields and a results array of matching records.",
  inputSchema,
  outputSchema: getFormByFormIdRecordResponse,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    const { formId, ...queryParams } = params;
    return executeGetApiCall<ReturnType<ApiClient["getFormByFormIdRecord"]>, ApiClient>(
      (client) => client.getFormByFormIdRecord(formId, queryParams, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof getFormByFormIdRecordResponse>;

export default withStandardDecorators(ListRecordsTool);
