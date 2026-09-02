/**
 * Get Data Source Scaffold Tool
 *
 * Returns a blank/default Umbraco Forms data source structure, showing the
 * shape and default values a new data source starts from before it is
 * customized and saved with create-data-source.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getDataSourceScaffoldResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetDataSourceScaffoldTool = {
  name: "get-data-source-scaffold",
  description:
    "Gets the default/blank structure for a new Umbraco Forms data source, before a name, " +
    "type, or settings have been assigned. Useful for inspecting the default shape and " +
    "field values Umbraco starts a new data source with. To actually create a data " +
    "source, use create-data-source instead — it applies this scaffold internally.",
  inputSchema: {},
  outputSchema: getDataSourceScaffoldResponse,
  slices: ["scaffold"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getDataSourceScaffold"]>, ApiClient>((client) =>
      client.getDataSourceScaffold(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<Record<string, never>, typeof getDataSourceScaffoldResponse>;

export default withStandardDecorators(GetDataSourceScaffoldTool);
