/**
 * Get Form Has Relations Tool
 *
 * Quick boolean check for whether a form is referenced by other content.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getFormByIdHasRelationsParams } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = getFormByIdHasRelationsParams.shape;

// The API returns a bare boolean, not an object — MCP output schemas must be
// z.object(), so this tool omits outputSchema and returns the boolean as
// unstructured content instead of wrapping/misrepresenting the shape.
const GetFormHasRelationsTool: ToolDefinition<typeof inputSchema> = {
  name: "get-form-has-relations",
  description:
    "Checks whether a form has any relations to other Umbraco content (e.g. it is embedded on a page). Returns a single boolean. Use this as a fast pre-check before deleting a form; use get-form-relations for the full list of related items.",
  inputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id }) => {
    return executeGetApiCall<boolean, ApiClient>((client) =>
      client.getFormByIdHasRelations(id, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(GetFormHasRelationsTool);
