/**
 * Query Analytics Origins Overview Tool
 *
 * Runs a summarized origins analytics query — a condensed view of which
 * pages/sources form submissions came from. Use query-analytics-origins
 * instead when you need the full per-page/per-URL breakdown.
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
    .default(["entries", "sources"])
    .describe(`Metrics to include as columns. Available: ${METRICS_SUMMARY}.`),
  dimensions: z
    .array(z.enum(DIMENSION_VALUES))
    .default(["formId", "formName"])
    .describe(
      `Dimensions to group rows by (one row per unique combination). Available: ${DIMENSIONS_SUMMARY}. Defaults to one summary row per form.`,
    ),
  sort: z
    .enum(COLUMN_VALUES)
    .optional()
    .describe("Column to sort rows by. Omit for the API's default ordering."),
};

const outputSchema = analyticsQueryResultSchema;

const QueryAnalyticsOriginsOverviewTool = {
  name: "query-analytics-origins-overview",
  description:
    "Gets a condensed summary of where form submissions originated from — a rollup of source " +
    "pages/URLs per form, rather than the full per-page breakdown. Read-only: this only queries " +
    "existing submission data, it does not create or change anything. Use this for a quick summary " +
    "of origin diversity; use query-analytics-origins instead when you need the full per-page/URL " +
    "detail.",
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
      ReturnType<ApiClient["postAnalyticsOriginsOverview"]>,
      ApiClient
    >(withMappedAnalyticsRows((client) => client.postAnalyticsOriginsOverview(payload, CAPTURE_RAW_HTTP_RESPONSE)));
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(QueryAnalyticsOriginsOverviewTool);
