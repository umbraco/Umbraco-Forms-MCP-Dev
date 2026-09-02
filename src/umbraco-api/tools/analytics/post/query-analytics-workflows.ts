/**
 * Query Analytics Workflows Tool
 *
 * Runs a workflow-run analytics query — how many times workflows were
 * triggered and how many succeeded or failed, typically broken down by
 * workflow. Use this to investigate workflow reliability/errors, as
 * opposed to submission volume.
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
    .default(["triggered", "success", "failures"])
    .describe(`Metrics to include as columns. Available: ${METRICS_SUMMARY}.`),
  dimensions: z
    .array(z.enum(DIMENSION_VALUES))
    .default(["workflowId", "workflowName"])
    .describe(
      `Dimensions to group rows by (one row per unique combination). Available: ${DIMENSIONS_SUMMARY}. Defaults to one row per workflow.`,
    ),
  sort: z
    .enum(COLUMN_VALUES)
    .optional()
    .describe("Column to sort rows by. Omit for the API's default ordering."),
};

const outputSchema = analyticsQueryResultSchema;

const QueryAnalyticsWorkflowsTool = {
  name: "query-analytics-workflows",
  description:
    "Gets workflow run analytics — how many times workflows were triggered and how many runs " +
    "succeeded vs. failed, grouped per workflow by default. Read-only: this only queries existing " +
    "workflow-run data, it does not trigger, retry, or change any workflow. Use this to investigate " +
    "workflow reliability or errors; use query-analytics-overview for a broader per-form summary " +
    "that includes a total workflow error count.",
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

    return executeGetApiCall<ReturnType<ApiClient["postAnalyticsWorkflows"]>, ApiClient>(
      withMappedAnalyticsRows((client) => client.postAnalyticsWorkflows(payload, CAPTURE_RAW_HTTP_RESPONSE)),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(QueryAnalyticsWorkflowsTool);
