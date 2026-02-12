import { z } from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getPrevalueSourceByIdValuesResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: z.string().uuid().describe("The unique ID of the prevalue source to get values from"),
  formId: z.string().uuid().optional().describe("Optional form ID for context-specific values"),
  fieldId: z.string().uuid().optional().describe("Optional field ID for context-specific values"),
};

const GetPrevalueSourceValues = {
  name: "get-prevalue-source-values",
  description:
    "Resolve the actual option values for a prevalue source. Returns the list of value/caption pairs. Optionally provide formId and fieldId for context-specific values.",
  inputSchema,
  outputSchema: getPrevalueSourceByIdValuesResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["getPrevalueSourceByIdValues"]>, ApiClient>(
      (client) => client.getPrevalueSourceByIdValues(
        params.id,
        { formId: params.formId, fieldId: params.fieldId },
        CAPTURE_RAW_HTTP_RESPONSE
      )
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof getPrevalueSourceByIdValuesResponse>;

export default withStandardDecorators(GetPrevalueSourceValues);
