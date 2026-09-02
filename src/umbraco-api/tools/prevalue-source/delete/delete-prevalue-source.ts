/**
 * Delete Prevalue Source Tool
 *
 * Permanently deletes a prevalue source. This is NOT idempotent — a second
 * call with the same ID will fail with 404 because the source no longer
 * exists. Deleting a prevalue source that is still referenced by a form
 * field will break that field's option list, so confirm it is unused first
 * (e.g. by checking the forms that reference it).
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
  id: z.uuid().describe("ID of the prevalue source to delete."),
};

const deletePrevalueSourceTool: ToolDefinition<typeof inputSchema, undefined> = {
  name: "delete-prevalue-source",
  description:
    "Permanently deletes a prevalue source by ID. Not idempotent — calling " +
    "it twice fails the second time with 404. Any field still using this " +
    "source as its option provider will lose its options, so verify it is " +
    "unused before deleting.",
  inputSchema,
  slices: ["delete"],
  annotations: {
    destructiveHint: true,
  },
  handler: async ({ id }) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.deletePrevalueSourceById(id, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(deletePrevalueSourceTool);
