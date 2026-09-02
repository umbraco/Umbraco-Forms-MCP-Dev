/**
 * Get Prevalue Source Tool
 *
 * Fetches a single prevalue source (a reusable provider that resolves a
 * dropdown/list field's options at render or submit time, e.g. from a REST
 * endpoint, SQL query, or Umbraco members) by its ID.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getPrevalueSourceByIdResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: z.uuid().describe("ID of the prevalue source to fetch."),
};

const outputSchema = getPrevalueSourceByIdResponse;

const getPrevalueSourceTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-prevalue-source",
  description:
    "Gets a single prevalue source by ID, including its name, provider type " +
    "(fieldPreValueSourceTypeId), settings, and cache duration. Use this to " +
    "inspect an existing prevalue source before updating it. Use " +
    "list-prevalue-sources to find the ID first if you don't have it.",
  inputSchema,
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id }) => {
    return executeGetApiCall<ReturnType<ApiClient["getPrevalueSourceById"]>, ApiClient>(
      (client) => client.getPrevalueSourceById(id, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(getPrevalueSourceTool);
