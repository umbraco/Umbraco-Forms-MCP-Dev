/**
 * Get Field Type By Id Tool
 *
 * Looks up a single built-in Umbraco Forms field type by its id, returning its
 * full definition including all configurable settings.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getFieldTypeByIdResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: z.uuid().describe("The id of the field type to fetch. Use list-field-types to find valid ids."),
};

const GetFieldTypeByIdTool = {
  name: "get-field-type-by-id",
  description:
    "Gets a single built-in Umbraco Forms field type by its id, including its alias, " +
    "name, icon, group, and full list of configurable settings. Field types are fixed " +
    "system definitions, not user-created entities. Returns a 404-style error if the id " +
    "does not match a known field type — use list-field-types first if the id is unknown.",
  inputSchema,
  outputSchema: getFieldTypeByIdResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id }) => {
    return executeGetApiCall<ReturnType<ApiClient["getFieldTypeById"]>, ApiClient>((client) =>
      client.getFieldTypeById(id, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof getFieldTypeByIdResponse>;

export default withStandardDecorators(GetFieldTypeByIdTool);
