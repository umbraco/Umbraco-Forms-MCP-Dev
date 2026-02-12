import * as zod from "zod";
import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  formId: zod.string().uuid().describe("The form ID the record belongs to"),
  recordId: zod.string().uuid().describe("The record ID to update. Use the uniqueId from list-records."),
  fields: zod.array(zod.object({
    fieldId: zod.string().uuid().describe("The field ID to update"),
    values: zod.array(zod.string()).describe("New values for the field"),
  })).describe("Array of field updates. Each entry specifies a fieldId and its new values."),
};

const outputSchema = zod.object({
  success: zod.boolean(),
});

const UpdateRecordTool = {
  name: "update-record",
  description:
    "Update field values on an existing form submission record. Provide the form ID, record ID, and an array of field updates. Each field update needs the field ID and new values. Use list-records to find record and field IDs.",
  inputSchema,
  outputSchema,
  slices: ["update"],
  annotations: {
    idempotentHint: true,
  },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.putFormByFormIdRecordByRecordId(
        params.formId,
        params.recordId,
        params.fields,
        CAPTURE_RAW_HTTP_RESPONSE
      )
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(UpdateRecordTool);
