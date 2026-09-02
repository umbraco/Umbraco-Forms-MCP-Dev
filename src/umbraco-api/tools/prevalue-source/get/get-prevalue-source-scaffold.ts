/**
 * Get Prevalue Source Scaffold Tool
 *
 * Returns a blank prevalue source template with server-generated defaults
 * (ID, audit fields, default cache duration, etc.) already filled in. Use
 * this to inspect the default shape of a new prevalue source before
 * creating one — create-prevalue-source already fetches this internally,
 * so you only need this tool if you want to see the defaults directly
 * (e.g. the default cachePrevaluesFor value).
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getPrevalueSourceScaffoldResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const outputSchema = getPrevalueSourceScaffoldResponse;

const getPrevalueSourceScaffoldTool: ToolDefinition<undefined, typeof outputSchema> = {
  name: "get-prevalue-source-scaffold",
  description:
    "Gets a blank prevalue source template with server-generated defaults " +
    "(ID and default cache duration). Informational only — " +
    "create-prevalue-source already fetches a fresh scaffold internally, " +
    "so you don't need to call this before creating a source.",
  outputSchema,
  slices: ["scaffold"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getPrevalueSourceScaffold"]>, ApiClient>(
      (client) => client.getPrevalueSourceScaffold(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(getPrevalueSourceScaffoldTool);
