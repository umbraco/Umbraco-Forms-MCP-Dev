/**
 * Get Forms Are Referenced Tool
 *
 * Bulk-checks a set of form IDs for whether each is referenced elsewhere.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormAreReferencedQueryParams,
  getFormAreReferencedResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = getFormAreReferencedQueryParams.shape;
const outputSchema = getFormAreReferencedResponse;

const GetFormsAreReferencedTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-forms-are-referenced",
  description:
    "Given a list of form IDs, returns only the subset that are referenced elsewhere in Umbraco (e.g. embedded on content). Use this to bulk-check several forms at once before considering deletion; for a single form prefer get-form-has-relations.",
  inputSchema,
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id, skip, take }) => {
    return executeGetApiCall<ReturnType<ApiClient["getFormAreReferenced"]>, ApiClient>(
      (client) => client.getFormAreReferenced({ id, skip, take }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(GetFormsAreReferencedTool);
