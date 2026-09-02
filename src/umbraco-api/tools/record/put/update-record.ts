/**
 * Update Record Tool
 *
 * Overwrites the values of one or more fields on an existing submitted record.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  putFormByFormIdRecordByRecordIdParams,
  putFormByFormIdRecordByRecordIdBodyItem,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  formId: putFormByFormIdRecordByRecordIdParams.shape.formId.describe(
    "ID of the form the record belongs to.",
  ),
  recordId: putFormByFormIdRecordByRecordIdParams.shape.recordId.describe(
    "ID of the existing record (submitted entry) to update.",
  ),
  fields: z
    .array(putFormByFormIdRecordByRecordIdBodyItem)
    .min(1)
    .describe(
      "Field values to overwrite. Each entry is { fieldId, values }, where fieldId is the " +
        "existing field's ID and values is the new array of value(s) for that field " +
        "(a single-value field still uses a one-element array). Only listed fields are " +
        "changed; fields not included are left untouched.",
    ),
};

const UpdateRecordTool = {
  name: "update-record",
  description:
    "Updates the values of one or more fields on an existing form submission (record). " +
    "Only affects the fields you list — other field values on the record are left as-is. " +
    "Requires the field IDs and record ID to already exist; does not create new records or " +
    "add new fields. Use search-records first to find the recordId and field IDs.",
  inputSchema,
  slices: ["update"],
  annotations: {
    idempotentHint: true,
  },
  handler: async ({ formId, recordId, fields }) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.putFormByFormIdRecordByRecordId(formId, recordId, fields, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(UpdateRecordTool);
