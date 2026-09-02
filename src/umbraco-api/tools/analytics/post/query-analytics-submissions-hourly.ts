/**
 * Query Analytics Submissions Hourly Tool
 *
 * Runs a submissions-by-hour-of-day analytics query — how entry volume is
 * distributed across the 24 hours of the day, typically to spot peak
 * submission times. Use query-analytics-submissions instead for a
 * day-by-day time series over a date range.
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
    .default(["hour"])
    .describe(
      `Dimensions to group rows by (one row per unique combination). Available: ${DIMENSIONS_SUMMARY}. Defaults to one row per hour of day (0-23).`,
    ),
  sort: z
    .enum(COLUMN_VALUES)
    .optional()
    .describe("Column to sort rows by. Omit for the API's default ordering."),
};

const outputSchema = analyticsQueryResultSchema;

const QueryAnalyticsSubmissionsHourlyTool = {
  name: "query-analytics-submissions-hourly",
  description:
    "Gets form submission volume broken down by hour of day (0-23) over a date range, to reveal " +
    "which hours are busiest. Read-only: this only queries existing submission data, it does not " +
    "create or change anything. Use this for 'what time of day do people submit' questions; use " +
    "query-analytics-submissions instead for a per-calendar-day time series.",
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

    return executeGetApiCall<
      ReturnType<ApiClient["postAnalyticsSubmissionsHourly"]>,
      ApiClient
    >(withMappedAnalyticsRows((client) => client.postAnalyticsSubmissionsHourly(payload, CAPTURE_RAW_HTTP_RESPONSE)));
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(QueryAnalyticsSubmissionsHourlyTool);
