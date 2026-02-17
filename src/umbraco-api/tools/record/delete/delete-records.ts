import * as zod from "zod";
import {
  withStandardDecorators,
  executeVoidApiCall,
  getApiClient,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
  createToolResultError,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  formId: zod.string().uuid().describe("The form ID the records belong to"),
  recordKeys: zod.array(zod.string().uuid()).min(1).describe("Array of record unique IDs to delete. Get these from list-records."),
};

const outputSchema = zod.object({
  success: zod.boolean(),
});

const DeleteRecordsTool = {
  name: "delete-records",
  description:
    "Permanently delete one or more form submission records. This is irreversible. Provide the record unique IDs from list-records. Finds the delete action automatically from the available record set actions.",
  inputSchema,
  outputSchema,
  slices: ["delete"],
  annotations: {
    destructiveHint: true,
    idempotentHint: false,
  },
  handler: async (params) => {
    // Find the delete action ID from available record set actions
    const client = getApiClient<ApiClient>();
    const actionsResponse = await client.getRecordSetActions(CAPTURE_RAW_HTTP_RESPONSE);
    const actions = (actionsResponse as any).data as Array<{ id: string; alias: string; name: string }>;

    if (!actions || !Array.isArray(actions)) {
      return createToolResultError("Failed to retrieve record set actions");
    }

    const deleteAction = actions.find(
      (a) => a.alias.toLowerCase() === "delete"
    );

    if (!deleteAction) {
      return createToolResultError(
        "Delete action not found. Available actions: " +
          actions.map((a) => a.alias).join(", ")
      );
    }

    // Execute the delete action on the specified records
    return executeVoidApiCall<ApiClient>(
      (client) => client.postFormByFormIdRecordActionsByActionIdExecute(
        params.formId,
        deleteAction.id,
        { recordKeys: params.recordKeys },
        CAPTURE_RAW_HTTP_RESPONSE
      )
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(DeleteRecordsTool);
