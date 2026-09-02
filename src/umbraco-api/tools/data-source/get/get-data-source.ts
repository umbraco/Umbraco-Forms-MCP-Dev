/**
 * Get Data Source Tool
 *
 * Looks up a single Umbraco Forms data source by its id, returning its full
 * definition including settings and its data source type.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getDataSourceByIdResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: z.uuid().describe("The id of the data source to fetch. Use list-data-sources to find valid ids."),
};

const GetDataSourceTool = {
  name: "get-data-source",
  description:
    "Gets a single Umbraco Forms data source by its id, including its name, settings, " +
    "data source type id, and whether it is currently valid. Data sources connect forms " +
    "to external data (e.g. SQL, Umbraco members, XML files) for pre-value lists or " +
    "workflows. Returns a 404-style error if the id does not match an existing data " +
    "source — use list-data-sources first if the id is unknown.",
  inputSchema,
  outputSchema: getDataSourceByIdResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id }) => {
    return executeGetApiCall<ReturnType<ApiClient["getDataSourceById"]>, ApiClient>((client) =>
      client.getDataSourceById(id, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof getDataSourceByIdResponse>;

export default withStandardDecorators(GetDataSourceTool);
