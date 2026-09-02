/**
 * Get Form Items By IDs Tool
 *
 * Bulk lookup of lightweight form item info (name, flags) by ID — used to
 * resolve references such as picker selections.
 */

import { z } from "zod";
import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getItemFormQueryParams,
  getItemFormResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = getItemFormQueryParams.shape;
const outputSchema = z.object({ items: getItemFormResponse });

const GetFormItemsByIdsTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-form-items-by-ids",
  description:
    "Looks up lightweight form info (name, ID, flags) for a specific set of form IDs, in one call. Use this to resolve a batch of known form IDs to their display names — for anything else, use get-form-by-id, list-forms or search-forms.",
  inputSchema,
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id }) => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getItemForm"]>, ApiClient>(
      (client) => client.getItemForm({ id }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(GetFormItemsByIdsTool);
