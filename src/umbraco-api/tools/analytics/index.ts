/**
 * Analytics Tool Collection
 *
 * Read-only analytics query tools for Umbraco Forms — submission volume,
 * workflow run outcomes, and submission origins. These endpoints are POST
 * requests (the query body is too complex for a REST GET), but they never
 * create, modify, or delete any data.
 */
import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import queryAnalyticsOverviewTool from "./post/query-analytics-overview.js";
import queryAnalyticsSubmissionsTool from "./post/query-analytics-submissions.js";
import queryAnalyticsSubmissionsHourlyTool from "./post/query-analytics-submissions-hourly.js";
import queryAnalyticsWorkflowsTool from "./post/query-analytics-workflows.js";
import queryAnalyticsOriginsTool from "./post/query-analytics-origins.js";
import queryAnalyticsOriginsOverviewTool from "./post/query-analytics-origins-overview.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "analytics",
    displayName: "Analytics",
    description:
      "Read-only analytics queries for Umbraco Forms: submission volume, workflow run outcomes, and submission origins.",
  },
  tools: () => [
    queryAnalyticsOverviewTool,
    queryAnalyticsSubmissionsTool,
    queryAnalyticsSubmissionsHourlyTool,
    queryAnalyticsWorkflowsTool,
    queryAnalyticsOriginsTool,
    queryAnalyticsOriginsOverviewTool,
  ],
};

export default collection;
