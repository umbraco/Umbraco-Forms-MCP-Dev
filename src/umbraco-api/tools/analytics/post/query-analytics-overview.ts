/**
 * Query Analytics Overview Tool
 *
 * Runs a per-form analytics overview query — the summary numbers shown on
 * the Forms dashboard (entries, workflow counts/errors, storage/retention
 * settings, etc.), optionally broken down by dimension.
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
    .default(["entries", "workflowCount", "workflowErrors", "storeRecords"])
    .describe(`Metrics to include as columns. Available: ${METRICS_SUMMARY}.`),
  dimensions: z
    .array(z.enum(DIMENSION_VALUES))
    .default(["formId", "formName"])
    .describe(
      `Dimensions to group rows by (one row per unique combination). Available: ${DIMENSIONS_SUMMARY}. Defaults to one row per form.`,
    ),
  sort: z
    .enum(COLUMN_VALUES)
    .optional()
    .describe("Column to sort rows by. Omit for the API's default ordering."),
};

const outputSchema = analyticsQueryResultSchema;

const QueryAnalyticsOverviewTool = {
  name: "query-analytics-overview",
  description:
    "Gets a high-level analytics overview across forms — the same summary data shown on the " +
    "Umbraco Forms dashboard, such as entry counts, workflow counts/errors, and storage/retention " +
    "settings, grouped per form by default. Read-only: this only queries existing submission and " +
    "workflow-run data, it does not create or change anything. Use this for a birds-eye view per " +
    "form; use query-analytics-submissions for a submissions time series, or query-analytics-workflows " +
    "for workflow run details.",
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

    return executeGetApiCall<ReturnType<ApiClient["postAnalyticsOverview"]>, ApiClient>(
      withMappedAnalyticsRows((client) => client.postAnalyticsOverview(payload, CAPTURE_RAW_HTTP_RESPONSE)),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(QueryAnalyticsOverviewTool);
