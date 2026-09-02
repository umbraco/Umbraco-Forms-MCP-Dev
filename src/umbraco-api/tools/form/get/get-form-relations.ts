/**
 * Get Form Relations Tool
 *
 * Full list of Umbraco relations (content, media, members, etc.) tied to a form.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormByIdRelationsParams,
  getFormByIdRelationsResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = getFormByIdRelationsParams.shape;
const outputSchema = getFormByIdRelationsResponse;

const GetFormRelationsTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-form-relations",
  description:
    "Gets the full list of Umbraco relations for a form — the related node's key, name, type and relation type details. More detailed than get-form-has-relations, useful for understanding exactly what would be affected before deleting or moving a form.",
  inputSchema,
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id }) => {
    return executeGetApiCall<ReturnType<ApiClient["getFormByIdRelations"]>, ApiClient>(
      (client) => client.getFormByIdRelations(id, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(GetFormRelationsTool);
