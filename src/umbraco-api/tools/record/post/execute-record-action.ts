import * as zod from "zod";
import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  formId: zod.string().uuid().describe("The form ID the records belong to"),
  actionId: zod.string().uuid().describe("The action ID to execute. Use list-record-set-actions to find available actions."),
  recordKeys: zod.array(zod.string().uuid()).describe("Array of record unique IDs to execute the action on"),
};

const outputSchema = zod.object({
  success: zod.boolean(),
});

const ExecuteRecordActionTool = {
  name: "execute-record-action",
  description:
    "Execute a bulk action on a set of form submission records. Use list-record-set-actions first to discover available actions and their IDs. Common actions include approve, reject, and delete. Provide the record unique IDs from list-records.",
  inputSchema,
  outputSchema,
  slices: [],
  annotations: {
    destructiveHint: true,
    idempotentHint: false,
  },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.postFormByFormIdRecordActionsByActionIdExecute(
        params.formId,
        params.actionId,
        { recordKeys: params.recordKeys },
        CAPTURE_RAW_HTTP_RESPONSE
      )
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(ExecuteRecordActionTool);
