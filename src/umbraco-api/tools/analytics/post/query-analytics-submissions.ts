/**
 * Query Analytics Submissions Tool
 *
 * Runs a submissions-over-time analytics query — how many entries came in,
 * typically broken down by calendar date. Use this for a time series of
 * submission volume; use query-analytics-submissions-hourly for a
 * within-day (hour-of-day) breakdown instead.
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
    .default(["entries", "uniqueMembers"])
    .describe(`Metrics to include as columns. Available: ${METRICS_SUMMARY}.`),
  dimensions: z
    .array(z.enum(DIMENSION_VALUES))
    .default(["date"])
    .describe(
      `Dimensions to group rows by (one row per unique combination). Available: ${DIMENSIONS_SUMMARY}. Defaults to one row per calendar day.`,
    ),
  sort: z
    .enum(COLUMN_VALUES)
    .optional()
    .describe("Column to sort rows by. Omit for the API's default ordering."),
};

const outputSchema = analyticsQueryResultSchema;

const QueryAnalyticsSubmissionsTool = {
  name: "query-analytics-submissions",
  description:
    "Gets a time series of form submissions (entries) over a date range, grouped by calendar " +
    "date by default. Read-only: this only queries existing submission data, it does not create " +
    "or change anything. Use this to answer 'how many submissions per day/week/month' questions; " +
    "use query-analytics-submissions-hourly for an hour-of-day breakdown instead of by date, or " +
    "query-analytics-overview for a per-form summary without a time dimension.",
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

    return executeGetApiCall<ReturnType<ApiClient["postAnalyticsSubmissions"]>, ApiClient>(
      withMappedAnalyticsRows((client) => client.postAnalyticsSubmissions(payload, CAPTURE_RAW_HTTP_RESPONSE)),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(QueryAnalyticsSubmissionsTool);
