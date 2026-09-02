/**
 * Get Record Page Number Tool
 *
 * Given the same paging/filter/sort options as search-records, returns which
 * page a specific record (recordId) falls on — useful for jumping straight
 * to the page containing a known record.
 */

import {
  withStandardDecorators,
  createToolResult,
  getApiClient,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
  type HttpResponse,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormByFormIdRecordPageNumberParams,
  getFormByFormIdRecordPageNumberQueryParams,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  formId: getFormByFormIdRecordPageNumberParams.shape.formId.describe(
    "ID of the form whose records to page through.",
  ),
  ...getFormByFormIdRecordPageNumberQueryParams.shape,
  recordId: getFormByFormIdRecordPageNumberQueryParams.shape.recordId
    .unwrap()
    .describe("ID of the record to locate. Required — this tool is meaningless without it."),
};

const outputSchema = z.object({
  pageNumber: z
    .number()
    .int()
    .optional()
    .describe("The page the target record falls on, given the take/sort/filter options."),
});

const GetRecordPageNumberTool = {
  name: "get-record-page-number",
  description:
    "Finds which page a specific record falls on for a given page size, sort order, and " +
    "filters — the same options used by search-records. Pass the target record's ID via " +
    "recordId, along with the same take/sortBy/sortOrder/filter/states/date-range options " +
    "you'd use for search-records, to get back the page number containing it. Use this to " +
    "jump straight to the page containing a known record instead of paging through results " +
    "manually.",
  inputSchema,
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ formId, ...query }) => {
    const client = getApiClient<ApiClient>();
    const response = (await client.getFormByFormIdRecordPageNumber(
      formId,
      query,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<number | void>;

    return createToolResult({
      pageNumber: typeof response.data === "number" ? response.data : undefined,
    });
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(GetRecordPageNumberTool);
