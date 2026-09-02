/**
 * Get Member Form Summaries Tool
 *
 * Lists a summary of every Umbraco Forms form that a specific member has
 * submitted entries for, including how many entries they submitted per form.
 */

import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getMemberByMemberKeyFormSummariesResponseItem } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  memberKey: z
    .string()
    .describe("The unique key (GUID) of the Umbraco member whose form submission summary should be fetched."),
};

const outputSchema = z.object({
  items: z.array(getMemberByMemberKeyFormSummariesResponseItem),
});

const GetMemberFormSummariesTool = {
  name: "get-member-form-summaries",
  description:
    "Gets a summary of the forms a specific Umbraco member has submitted entries for, listing each " +
    "form's id, name, and how many entries that member has submitted to it. Use this to see which " +
    "forms a known member has interacted with and how often — not to look up individual form entry " +
    "data, and not for anonymous (non-member) submissions.",
  inputSchema,
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ memberKey }) => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getMemberByMemberKeyFormSummaries"]>, ApiClient>((client) =>
      client.getMemberByMemberKeyFormSummaries(memberKey, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(GetMemberFormSummariesTool);
