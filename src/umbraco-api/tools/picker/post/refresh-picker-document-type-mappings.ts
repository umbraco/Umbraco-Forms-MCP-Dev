/**
 * Refresh Picker Document Type Mappings Tool
 *
 * Recomputes a Forms field's mapping of picked values onto a document type's
 * properties (e.g. after the document type's properties have changed) and
 * returns the refreshed mapping. This is a recompute/refresh action, not a
 * resource-creation endpoint — it returns the recalculated mapping data
 * directly rather than creating a new persisted entity or Location header.
 */

import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  postPickerDocumentTypeMappingsRefreshBody,
  postPickerDocumentTypeMappingsRefreshResponseItem,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = postPickerDocumentTypeMappingsRefreshBody.shape;

const outputSchema = z.object({
  items: z.array(postPickerDocumentTypeMappingsRefreshResponseItem),
});

const RefreshPickerDocumentTypeMappingsTool = {
  name: "refresh-picker-document-type-mappings",
  description:
    "Recomputes the mapping between a Forms field's current property mappings and a target document type's " +
    "properties, identified by the document type's alias. Pass the document type alias and the current list of " +
    "property mappings (each with id, value, field, and staticValue); the refreshed mapping list is returned. " +
    "Use this after a document type's properties have changed, to re-validate or update an existing mapping — " +
    "this does not create a new document type or mapping resource, it only recalculates the existing one.",
  inputSchema,
  outputSchema,
  slices: [],
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
  },
  handler: async ({ doctypeAlias, currentProperties }) => {
    return executeGetItemsApiCall<
      ReturnType<ApiClient["postPickerDocumentTypeMappingsRefresh"]>,
      ApiClient
    >((client) =>
      client.postPickerDocumentTypeMappingsRefresh(
        { doctypeAlias, currentProperties },
        CAPTURE_RAW_HTTP_RESPONSE,
      ),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(RefreshPickerDocumentTypeMappingsTool);
