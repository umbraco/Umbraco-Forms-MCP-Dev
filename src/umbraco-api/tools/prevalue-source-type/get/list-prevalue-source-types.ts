import * as zod from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getPrevalueSourceTypeResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const emptyInput = zod.object({});

const ListPrevalueSourceTypes = {
  name: "list-prevalue-source-types",
  description:
    "List all available prevalue source type definitions. Prevalue source types define what kinds of prevalue sources can be created (e.g., Get values from textfile, Umbraco data type prevalues, SQL database). Each type includes its configuration settings schema. Returns all installed prevalue source types. Use this to discover what types are available before creating a prevalue source instance.",
  inputSchema: emptyInput.shape,
  outputSchema: getPrevalueSourceTypeResponse,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getPrevalueSourceType"]>, ApiClient>(
      (client) => client.getPrevalueSourceType(CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof emptyInput.shape, typeof getPrevalueSourceTypeResponse>;

export default withStandardDecorators(ListPrevalueSourceTypes);
