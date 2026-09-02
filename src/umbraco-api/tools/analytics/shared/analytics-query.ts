/**
 * Shared building blocks for the analytics query tools.
 *
 * All six `/analytics/*` endpoints take the same request shape
 * (`AnalyticsQueryGet`) and return the same result shape
 * (`AnalyticsQueryResult` — a column list plus a page of rows). The only
 * thing that differs between endpoints is *which* metrics/dimensions make
 * sense as defaults and how the rows should be interpreted.
 *
 * This module centralizes:
 * - the enum value lists (kept in sync with the generated `Metric`,
 *   `Dimension`, and `Column` unions),
 * - the common, LLM-facing input fields (date range, paging, sort, etc.),
 * - the transform from that flat input into the `AnalyticsQueryGet` body
 *   the API expects (filling in the `null`s the generated body requires).
 */
import { z } from "zod";
import type { HttpResponse } from "@umbraco-cms/mcp-server-sdk";
import type {
  AnalyticsQueryGet,
  AnalyticsQueryResult,
  Column,
  Dimension,
  Metric,
} from "../../../api/generated/umbracoFormsManagementApi.js";

/**
 * `Metric` values an LLM can pick from, excluding the placeholder
 * `UNDEFINED` value that only exists to represent "no metric" internally.
 */
export const METRIC_VALUES = [
  "entries",
  "workflowErrors",
  "workflowCount",
  "storeRecords",
  "retentionDays",
  "isMultiPage",
  "sources",
  "pageId",
  "pageName",
  "workflowId",
  "workflowName",
  "triggered",
  "failures",
  "success",
  "uniqueMembers",
] as const satisfies readonly Metric[];

/** `Dimension` values an LLM can pick from (excludes `UNDEFINED`). */
export const DIMENSION_VALUES = [
  "formId",
  "formName",
  "pageId",
  "pageName",
  "pageUrl",
  "workflowId",
  "workflowName",
  "date",
  "hour",
] as const satisfies readonly Dimension[];

/** `Column` values a result set can be sorted by (excludes `UNDEFINED`). */
export const COLUMN_VALUES = [
  "entries",
  "workflowErrors",
  "workflowCount",
  "formId",
  "formName",
  "storeRecords",
  "retentionDays",
  "isMultiPage",
  "sources",
  "pageId",
  "pageName",
  "pageUrl",
  "workflowId",
  "workflowName",
  "triggered",
  "failures",
  "success",
  "date",
  "hour",
  "uniqueMembers",
] as const satisfies readonly Column[];

/** Human-readable summary of metrics, for embedding in tool descriptions. */
export const METRICS_SUMMARY =
  "entries (submission count), workflowErrors, workflowCount, storeRecords " +
  "(whether entries are stored), retentionDays, isMultiPage, sources, pageId, " +
  "pageName, workflowId, workflowName, triggered/success/failures (workflow " +
  "run outcomes), uniqueMembers";

/** Human-readable summary of dimensions, for embedding in tool descriptions. */
export const DIMENSIONS_SUMMARY =
  "formId, formName, pageId, pageName, pageUrl, workflowId, workflowName, " +
  "date (calendar day), hour (hour of day)";

/**
 * Common fields shared by every analytics query tool. Metrics/dimensions
 * are intentionally left out here — each tool defines those with defaults
 * and descriptions appropriate to what it measures.
 */
export const analyticsCommonInputShape = {
  formId: z
    .uuid()
    .optional()
    .describe(
      "Restrict the query to a single form by its id. Omit to aggregate across all forms.",
    ),
  filter: z
    .string()
    .optional()
    .describe(
      "Free-text filter applied server-side (e.g. matches against form or page name). Omit for no filtering.",
    ),
  startDate: z
    .iso.datetime({ local: true, offset: true })
    .optional()
    .describe(
      "Start of the date range (ISO 8601, e.g. '2026-08-01T00:00:00+02:00'). Omit to include all history.",
    ),
  endDate: z
    .iso.datetime({ local: true, offset: true })
    .optional()
    .describe(
      "End of the date range (ISO 8601). Omit to include up to the current moment.",
    ),
  timeZone: z
    .string()
    .optional()
    .describe(
      "IANA time zone (e.g. 'Europe/Copenhagen') used to bucket 'date'/'hour' dimensions. Omit to use the server default (UTC).",
    ),
  ascending: z
    .boolean()
    .default(true)
    .describe("Sort rows ascending (true) or descending (false) by the sort column."),
  page: z
    .int()
    .min(1)
    .default(1)
    .describe("1-based page number of results to return."),
  pageSize: z
    .int()
    .min(1)
    .max(500)
    .default(50)
    .describe("Number of rows to return per page."),
  includeSubpages: z
    .boolean()
    .default(true)
    .describe(
      "For multi-page forms, include data broken down by subpage in the aggregation.",
    ),
};

export type AnalyticsCommonInput = {
  formId?: string;
  filter?: string;
  startDate?: string;
  endDate?: string;
  timeZone?: string;
  ascending: boolean;
  page: number;
  pageSize: number;
  includeSubpages: boolean;
  metrics: Metric[];
  dimensions: Dimension[];
  sort?: Column;
};

/**
 * The API's `startDate`/`endDate` are typed as nullable in the generated
 * schema but are actually required at runtime — omitting them (sending
 * `null`) fails with "The StartDate/EndDate field is required." These
 * sentinels stand in for "all history" / "up to now" so the LLM-facing
 * fields can stay genuinely optional without the request failing.
 */
const DEFAULT_START_DATE = "0001-01-01T00:00:00Z";

/**
 * Builds the `AnalyticsQueryGet` request body from the flat, LLM-facing
 * input, filling in defaults for fields the API requires but that this
 * tool treats as optional (see `DEFAULT_START_DATE` above), and `null`
 * for fields the API genuinely accepts as optional.
 */
export function buildAnalyticsQueryPayload(
  input: AnalyticsCommonInput,
): AnalyticsQueryGet {
  return {
    formId: input.formId ?? null,
    filter: input.filter ?? null,
    startDate: input.startDate ?? DEFAULT_START_DATE,
    endDate: input.endDate ?? new Date().toISOString(),
    timeZone: input.timeZone ?? null,
    metrics: input.metrics,
    dimensions: input.dimensions,
    sort: input.sort ?? null,
    ascending: input.ascending,
    page: input.page,
    pageSize: input.pageSize,
    includeSubpages: input.includeSubpages,
  };
}

/**
 * The raw API result reports `columns: Column[]` and `rows: unknown[][]` —
 * positional arrays the caller has to zip together by index to know which
 * value is which column. That's error-prone for an LLM to do reliably, so
 * every analytics tool maps rows into `Record<column, value>` objects before
 * returning them (see `mapAnalyticsRows` / `withMappedAnalyticsRows` below).
 */
export const analyticsQueryResultSchema = z.object({
  columns: z
    .array(z.string())
    .describe("Column names — each row below is keyed by these names."),
  currentPage: z.int(),
  rows: z
    .array(z.record(z.string(), z.unknown()))
    .describe("Result rows, each keyed by the column names listed in `columns`."),
  rowsPerPage: z.int(),
  totalRows: z.int(),
  totalPages: z.int(),
  fromRow: z.int(),
  toRow: z.int(),
  uniqueMembers: z.int(),
});

/** Zips `columns`/`rows` from the raw API result into `Record<column, value>` rows. */
function mapAnalyticsRows(result: AnalyticsQueryResult) {
  const { columns, rows, ...rest } = result;
  return {
    ...rest,
    columns,
    rows: rows.map((row) =>
      Object.fromEntries(columns.map((column, i) => [column, row[i]])),
    ),
  };
}

/**
 * Wraps an analytics API call so a successful response's `rows` are mapped
 * into labeled objects before `executeGetApiCall` sees them. Error responses
 * (non-2xx, or a shape that isn't an `AnalyticsQueryResult`) pass through
 * unchanged so the SDK's normal error handling still applies.
 */
export function withMappedAnalyticsRows<TClient>(
  apiCall: (client: TClient) => Promise<AnalyticsQueryResult | HttpResponse<AnalyticsQueryResult>>,
): (client: TClient) => Promise<HttpResponse<ReturnType<typeof mapAnalyticsRows>>> {
  return async (client) => {
    const response = (await apiCall(client)) as HttpResponse<AnalyticsQueryResult>;
    const data = response.data;
    const isSuccess = response.status >= 200 && response.status < 300;
    if (isSuccess && data && Array.isArray(data.columns) && Array.isArray(data.rows)) {
      return { ...response, data: mapAnalyticsRows(data) };
    }
    return response as unknown as HttpResponse<ReturnType<typeof mapAnalyticsRows>>;
  };
}
