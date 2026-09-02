/**
 * List Prevalue Sources Tool
 *
 * Lists prevalue sources with pagination. Prevalue sources are reusable
 * providers that resolve a dropdown/list field's options (e.g. from a REST
 * endpoint, SQL query, or Umbraco members) so multiple forms/fields can
 * share the same set of options.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getPrevalueSourceResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  skip: z.coerce.number().int().min(0).optional().describe("Number of prevalue sources to skip, for pagination. Defaults to 0."),
  take: z.coerce.number().int().min(1).optional().describe("Maximum number of prevalue sources to return. Defaults to all."),
};

const outputSchema = getPrevalueSourceResponse;

const listPrevalueSourcesTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "list-prevalue-sources",
  description:
    "Lists prevalue sources (reusable providers that resolve dropdown/list " +
    "field options, e.g. from a REST endpoint, SQL query, or Umbraco " +
    "members), with the total count and each source's name, provider type, " +
    "and settings. Use this to find a prevalue source's ID before reading, " +
    "updating, or deleting it.",
  inputSchema,
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ skip, take }) => {
    return executeGetApiCall<ReturnType<ApiClient["getPrevalueSource"]>, ApiClient>(
      (client) => client.getPrevalueSource({ skip, take }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(listPrevalueSourcesTool);
