/**
 * Get Form Referenced By Tool
 *
 * Lists the content items and other entities that reference a given form.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormByIdReferencedByParams,
  getFormByIdReferencedByQueryParams,
  getFormByIdReferencedByResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  ...getFormByIdReferencedByParams.shape,
  ...getFormByIdReferencedByQueryParams.shape,
};
const outputSchema = getFormByIdReferencedByResponse;

const GetFormReferencedByTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-form-referenced-by",
  description:
    "Lists the entities (documents, media, members, etc.) that reference a given form, with paging via skip/take. Use this to understand the blast radius before deleting or significantly changing a form.",
  inputSchema,
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id, skip, take }) => {
    return executeGetApiCall<ReturnType<ApiClient["getFormByIdReferencedBy"]>, ApiClient>(
      (client) =>
        client.getFormByIdReferencedBy(id, { skip, take }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(GetFormReferencedByTool);
