import * as zod from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getPrevalueSourceScaffoldResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const emptyInput = zod.object({});

const GetPrevalueSourceScaffold = {
  name: "get-prevalue-source-scaffold",
  description:
    "Gets an empty prevalue source scaffold with default values. Returns the structure needed to create a new prevalue source, including default settings and required fields. Use this to understand the prevalue source structure before calling create-prevalue-source.",
  inputSchema: emptyInput.shape,
  outputSchema: getPrevalueSourceScaffoldResponse,
  slices: ["scaffolding"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getPrevalueSourceScaffold"]>, ApiClient>(
      (client) => client.getPrevalueSourceScaffold(CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof emptyInput.shape, typeof getPrevalueSourceScaffoldResponse>;

export default withStandardDecorators(GetPrevalueSourceScaffold);
