/**
 * Generate Form Export Tool
 *
 * Triggers server-side generation of a form record export file, filtered by the given
 * criteria. Returns the identifiers needed to download the generated file with
 * download-export-file — it does not return the file contents itself.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  postExportQueryParams,
  postExportResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  formId: postExportQueryParams.shape.formId.describe(
    "ID of the form whose submitted records to export.",
  ),
  exportType: postExportQueryParams.shape.exportType.describe(
    'Alias of the export format to generate (e.g. "excel", "csv"). Use list-export-types to see the aliases available for this form.',
  ),
  skip: postExportQueryParams.shape.skip.describe(
    "Number of matching records to skip before starting the export. Use with take to export a subset/page of records.",
  ),
  take: postExportQueryParams.shape.take.describe(
    "Maximum number of records to include in the export.",
  ),
  memberKey: postExportQueryParams.shape.memberKey.describe(
    "Restrict the export to records submitted by a specific member.",
  ),
  sortBy: postExportQueryParams.shape.sortBy.describe(
    "Field alias to sort exported records by before applying skip/take.",
  ),
  sortOrder: postExportQueryParams.shape.sortOrder.describe(
    "Sort direction (Ascending or Descending) applied together with sortBy.",
  ),
  startDate: postExportQueryParams.shape.startDate.describe(
    "Only include records submitted on or after this ISO 8601 date-time.",
  ),
  endDate: postExportQueryParams.shape.endDate.describe(
    "Only include records submitted on or before this ISO 8601 date-time.",
  ),
  filter: postExportQueryParams.shape.filter.describe(
    "Free-text filter applied to record field values.",
  ),
  states: postExportQueryParams.shape.states.describe(
    "Restrict the export to records in these workflow states (e.g. Submitted, Approved, Rejected).",
  ),
  recordId: postExportQueryParams.shape.recordId.describe(
    "Restrict the export to a single specific record. Omit to export multiple records matching the other filters.",
  ),
  recordIds: postExportQueryParams.shape.recordIds.describe(
    "Restrict the export to a specific set of record IDs.",
  ),
};

const outputSchema = postExportResponse;

const GenerateFormExportTool = {
  name: "generate-form-export",
  description:
    "Generates an export file of a form's submitted records on the server, filtered by " +
    "date range, workflow state, member, free-text search, or specific record IDs, in the " +
    "given export format. Returns the formId and fileName of the generated file — pass " +
    "both to download-export-file to retrieve it afterward. This only starts generation " +
    "and returns file identifiers; it does not return the file's contents. Use " +
    "list-export-types first to find a valid exportType alias for the form.",
  inputSchema,
  outputSchema,
  slices: ["export"],
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
  handler: async (params) => {
    return executeGetApiCall<ReturnType<ApiClient["postExport"]>, ApiClient>((client) =>
      client.postExport(params, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(GenerateFormExportTool);
