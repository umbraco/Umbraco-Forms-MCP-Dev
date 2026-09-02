/**
 * Execute Record Action Tool
 *
 * Runs a bulk record-set action (e.g. approve, reject, delete) against one
 * or more submitted records for a form.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { postFormByFormIdRecordActionsByActionIdExecuteParams } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  formId: postFormByFormIdRecordActionsByActionIdExecuteParams.shape.formId.describe(
    "ID of the form the records belong to.",
  ),
  actionId: postFormByFormIdRecordActionsByActionIdExecuteParams.shape.actionId.describe(
    "ID of the record-set action to run, from get-record-set-actions (e.g. approve, " +
      "reject, or delete). Check that action's needsConfirm/confirmMessage before calling.",
  ),
  recordKeys: z
    .array(z.guid())
    .min(1)
    .describe("IDs of the existing records to run the action against."),
};

const ExecuteRecordActionTool = {
  name: "execute-record-action",
  description:
    "Executes a record-set action (such as approve, reject, or delete — see " +
    "get-record-set-actions for the available actions and their IDs) against one or more " +
    "existing records of a form. Some actions are destructive or irreversible (e.g. " +
    "delete); always check the action's needsConfirm and confirmMessage first and confirm " +
    "with the user before calling this for a destructive action. Not idempotent — running " +
    "the same action twice re-applies it and may error if the records are no longer in a " +
    "valid state for it.",
  inputSchema,
  slices: ["action"],
  annotations: {
    destructiveHint: true,
    idempotentHint: false,
  },
  handler: async ({ formId, actionId, recordKeys }) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.postFormByFormIdRecordActionsByActionIdExecute(
        formId,
        actionId,
        { recordKeys },
        CAPTURE_RAW_HTTP_RESPONSE,
      ),
    );
  },
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(ExecuteRecordActionTool);
