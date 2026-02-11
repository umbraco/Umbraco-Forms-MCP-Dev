import * as zod from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getDataSourceTypeResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const emptyInput = zod.object({});

const ListDataSourceTypes = {
  name: "list-data-source-types",
  description:
    "List all available data source type definitions. Data source types are templates that define what kinds of data sources can be created (e.g., SQL database, Umbraco content picker). Each type includes its configuration settings schema. Returns all available types (typically a small set of system-defined types). Use this to discover what types are available before creating a data source instance.",
  inputSchema: emptyInput.shape,
  outputSchema: getDataSourceTypeResponse,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getDataSourceType"]>, ApiClient>(
      (client) => client.getDataSourceType(CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof emptyInput.shape, typeof getDataSourceTypeResponse>;

export default withStandardDecorators(ListDataSourceTypes);
