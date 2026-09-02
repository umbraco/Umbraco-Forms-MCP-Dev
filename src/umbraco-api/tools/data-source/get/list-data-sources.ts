/**
 * List Data Sources Tool
 *
 * Lists Umbraco Forms data sources with paging, returning their names,
 * data source type ids, and validity state.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getDataSourceResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  skip: z.coerce.number().int().min(0).optional().describe("Number of data sources to skip, for paging. Defaults to 0."),
  take: z.coerce.number().int().min(1).optional().describe("Maximum number of data sources to return. Defaults to all."),
};

const ListDataSourcesTool = {
  name: "list-data-sources",
  description:
    "Lists Umbraco Forms data sources (connections used to feed forms with external " +
    "data, such as SQL queries, Umbraco members, or XML files), with the total count " +
    "and paging via skip/take. Use this to discover existing data source ids before " +
    "reading, updating, or deleting a specific one with get-data-source.",
  inputSchema,
  outputSchema: getDataSourceResponse,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ skip, take }) => {
    return executeGetApiCall<ReturnType<ApiClient["getDataSource"]>, ApiClient>((client) =>
      client.getDataSource({ skip, take }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof getDataSourceResponse>;

export default withStandardDecorators(ListDataSourcesTool);
