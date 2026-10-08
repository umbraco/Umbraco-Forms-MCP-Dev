/**
 * Delete Record Tool
 *
 * Permanently deletes a single form entry (record).
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { deleteFormByFormIdRecordByRecordIdParams } from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { withFormsFeature } from "../../shared/forms-version.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  formId: deleteFormByFormIdRecordByRecordIdParams.shape.formId.describe("ID of the form the record belongs to."),
  recordId: deleteFormByFormIdRecordByRecordIdParams.shape.recordId.describe("ID of the record to delete."),
};

const DeleteRecordTool: ToolDefinition<typeof inputSchema> = {
  name: "delete-record",
  description:
    "Permanently deletes one form entry (record). This cannot be undone, and entries often hold personal data a " +
    "site may be required to keep or to erase - confirm with the user before calling it. Find record IDs with " +
    "search-records. Needs the Forms \"delete entries\" permission, which Forms does not give even administrators " +
    "by default - a 403 means it has not been granted.",
  inputSchema,
  slices: ["delete"],
  annotations: {
    destructiveHint: true,
  },
  handler: async ({ formId, recordId }) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.deleteFormByFormIdRecordByRecordId(formId, recordId, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(withFormsFeature("recordWrite", DeleteRecordTool));
