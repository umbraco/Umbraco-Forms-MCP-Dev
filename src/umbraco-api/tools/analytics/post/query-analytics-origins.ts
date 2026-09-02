/**
 * Query Analytics Origins Tool
 *
 * Runs an origins analytics query — which pages/URLs form submissions came
 * from, typically broken down per page. Use query-analytics-origins-overview
 * instead for a coarser, summarized view of origins.
 */
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  analyticsCommonInputShape,
  analyticsQueryResultSchema,
  buildAnalyticsQueryPayload,
  COLUMN_VALUES,
  DIMENSION_VALUES,
  DIMENSIONS_SUMMARY,
  METRIC_VALUES,
  METRICS_SUMMARY,
  withMappedAnalyticsRows,
} from "../shared/analytics-query.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  ...analyticsCommonInputShape,
  metrics: z
    .array(z.enum(METRIC_VALUES))
    .default(["entries"])
    .describe(`Metrics to include as columns. Available: ${METRICS_SUMMARY}.`),
  dimensions: z
    .array(z.enum(DIMENSION_VALUES))
    .default(["pageId", "pageName", "pageUrl"])
    .describe(
      `Dimensions to group rows by (one row per unique combination). Available: ${DIMENSIONS_SUMMARY}. Defaults to one row per page/URL the form was submitted from.`,
    ),
  sort: z
    .enum(COLUMN_VALUES)
    .optional()
    .describe("Column to sort rows by. Omit for the API's default ordering."),
};

const outputSchema = analyticsQueryResultSchema;

const QueryAnalyticsOriginsTool = {
  name: "query-analytics-origins",
  description:
    "Gets a detailed breakdown of where form submissions originated from — which pages/URLs the " +
    "form was embedded on and how many entries each contributed. Read-only: this only queries " +
    "existing submission data, it does not create or change anything. Use this when you need the " +
    "full per-page list of origins; use query-analytics-origins-overview instead for a more " +
    "condensed summary view.",
  inputSchema,
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({
    formId,
    filter,
    startDate,
    endDate,
    timeZone,
    metrics,
    dimensions,
    sort,
    ascending,
    page,
    pageSize,
    includeSubpages,
  }) => {
    const payload = buildAnalyticsQueryPayload({
      formId,
      filter,
      startDate,
      endDate,
      timeZone,
      metrics,
      dimensions,
      sort,
      ascending,
      page,
      pageSize,
      includeSubpages,
    });

    return executeGetApiCall<ReturnType<ApiClient["postAnalyticsOrigins"]>, ApiClient>(
      withMappedAnalyticsRows((client) => client.postAnalyticsOrigins(payload, CAPTURE_RAW_HTTP_RESPONSE)),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(QueryAnalyticsOriginsTool);
