/**
 * Get Form Has Relations Tool
 *
 * Quick boolean check for whether a form is referenced by other content.
 */

import {
  withStandardDecorators,
  createToolResult,
  getApiClient,
  UmbracoApiError,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
  type HttpResponse,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getFormByIdHasRelationsParams } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = getFormByIdHasRelationsParams.shape;

// The API returns a bare boolean, but MCP's structuredContent must be a JSON
// object (per the protocol's own schema), so it's wrapped as { hasRelations }
// — same pattern as is-folder-empty.
const outputSchema = z.object({
  hasRelations: z.boolean().describe("True if the form is referenced by other Umbraco content."),
});

const GetFormHasRelationsTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-form-has-relations",
  description:
    "Checks whether a form has any relations to other Umbraco content (e.g. it is embedded on a page). Use this as a fast pre-check before deleting a form; use get-form-relations for the full list of related items.",
  inputSchema,
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id }) => {
    const client = getApiClient<ApiClient>();
    const response = (await client.getFormByIdHasRelations(
      id,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as unknown as HttpResponse<boolean>;

    if (response.status < 200 || response.status >= 300) {
      throw new UmbracoApiError(
        (response.data as unknown as { status: number; detail?: string }) ?? {
          status: response.status,
          detail: response.statusText,
        },
      );
    }

    return createToolResult({ hasRelations: Boolean(response.data) });
  },
};

export default withStandardDecorators(GetFormHasRelationsTool);
