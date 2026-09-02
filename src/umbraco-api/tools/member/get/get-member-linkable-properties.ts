/**
 * Get Member Linkable Properties Tool
 *
 * Lists the Umbraco member properties that can be linked to a form field
 * (e.g. via a field's "prevalue"/data source or default-value mapping),
 * optionally scoped to a specific field type.
 */

import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getMemberLinkablePropertiesResponseItem } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  fieldTypeId: z
    .uuid()
    .optional()
    .describe(
      "Optional id of a field type (see list-field-types) to filter the linkable member properties " +
        "down to only those compatible with that field type. Omit to list all linkable properties.",
    ),
};

const outputSchema = z.object({
  items: z.array(getMemberLinkablePropertiesResponseItem),
});

const GetMemberLinkablePropertiesTool = {
  name: "get-member-linkable-properties",
  description:
    "Lists the Umbraco member properties (alias and name) that can be linked to a form field, such " +
    "as pre-filling a field from the currently logged-in member's profile data. Optionally filter by " +
    "fieldTypeId to only see properties compatible with a given field type. Use this when configuring " +
    "a form field that should pull its value from member data — not for looking up an actual member's " +
    "submitted data (use get-member-form-summaries for that).",
  inputSchema,
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ fieldTypeId }) => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getMemberLinkableProperties"]>, ApiClient>((client) =>
      client.getMemberLinkableProperties({ fieldTypeId }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(GetMemberLinkablePropertiesTool);
