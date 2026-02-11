import * as zod from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getFormResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const emptyInput = zod.object({});

const ListForms = {
  name: "list-forms",
  description:
    "List all Umbraco Forms with basic information. Returns a summary of each form including its unique identifier, name, field count, and a brief summary description. This is useful for discovering available forms before retrieving full form details with get-form. The field count is returned as a string (e.g., '5 fields').",
  inputSchema: emptyInput.shape,
  outputSchema: getFormResponse,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getForm"]>, ApiClient>(
      (client) => client.getForm(CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof emptyInput.shape, typeof getFormResponse>;

export default withStandardDecorators(ListForms);
