/**
 * Get Form Referenced Descendants Tool
 *
 * Lists descendant entities referenced by a form (e.g. via a datasource or picker field).
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormByIdReferencedDescendantsParams,
  getFormByIdReferencedDescendantsQueryParams,
  getFormByIdReferencedDescendantsResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  ...getFormByIdReferencedDescendantsParams.shape,
  ...getFormByIdReferencedDescendantsQueryParams.shape,
};
const outputSchema = getFormByIdReferencedDescendantsResponse;

const GetFormReferencedDescendantsTool: ToolDefinition<
  typeof inputSchema,
  typeof outputSchema
> = {
  name: "get-form-referenced-descendants",
  description:
    "Lists the IDs of entities referenced by a form's own descendants (e.g. fields that reference other content), with paging via skip/take. Use get-form-referenced-by instead to see what references the form itself.",
  inputSchema,
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id, skip, take }) => {
    return executeGetApiCall<
      ReturnType<ApiClient["getFormByIdReferencedDescendants"]>,
      ApiClient
    >((client) =>
      client.getFormByIdReferencedDescendants(
        id,
        { skip, take },
        CAPTURE_RAW_HTTP_RESPONSE,
      ),
    );
  },
};

export default withStandardDecorators(GetFormReferencedDescendantsTool);
