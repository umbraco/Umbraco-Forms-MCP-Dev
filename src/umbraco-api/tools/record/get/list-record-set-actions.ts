import * as zod from "zod";
import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getRecordSetActionsResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const emptyInput = zod.object({});

const outputSchema = zod.object({ items: getRecordSetActionsResponse });

const ListRecordSetActionsTool = {
  name: "list-record-set-actions",
  description:
    "List all available bulk actions that can be executed on sets of form submission records. Returns action types with their IDs, names, descriptions, and whether they require confirmation. Use the returned action IDs with execute-record-action.",
  inputSchema: emptyInput.shape,
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getRecordSetActions"]>, ApiClient>(
      (client) => client.getRecordSetActions(CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof emptyInput.shape, typeof outputSchema>;

export default withStandardDecorators(ListRecordSetActionsTool);
