import * as zod from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getFormScaffoldResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const emptyInput = zod.object({});

const GetFormScaffold = {
  name: "get-form-scaffold",
  description:
    "Gets an empty form scaffold showing the default structure with pre-populated IDs and settings. Use this to understand the Umbraco Forms schema and its default values. Useful for inspecting what fields, pages, and workflows a form contains by default.",
  inputSchema: emptyInput.shape,
  outputSchema: getFormScaffoldResponse,
  slices: ["scaffolding"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getFormScaffold"]>, ApiClient>(
      (client) => client.getFormScaffold(CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof emptyInput.shape, typeof getFormScaffoldResponse>;

export default withStandardDecorators(GetFormScaffold);
