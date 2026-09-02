/**
 * Delete Data Source Tool
 *
 * Permanently deletes an Umbraco Forms data source by id. Not idempotent —
 * calling it again on an already-deleted id returns a 404-style error.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: z.uuid().describe("The id of the data source to delete. Use list-data-sources to find valid ids."),
};

const DeleteDataSourceTool = {
  name: "delete-data-source",
  description:
    "Permanently deletes an Umbraco Forms data source by id. This cannot be undone, and " +
    "any forms or workflows still referencing this data source may stop working — check " +
    "usage before deleting. Only use this on an id known to exist; a second call on the " +
    "same id will fail because the data source is already gone.",
  inputSchema,
  slices: ["delete"],
  annotations: {
    destructiveHint: true,
  },
  handler: async ({ id }) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.deleteDataSourceById(id, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(DeleteDataSourceTool);
