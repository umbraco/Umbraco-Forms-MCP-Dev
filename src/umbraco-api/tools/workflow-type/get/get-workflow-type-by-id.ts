/**
 * Get Workflow Type By Id Tool
 *
 * Looks up a single Umbraco Forms workflow type by its id, returning its full
 * definition including all configurable settings and configuration status.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getWorkflowTypeByIdResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: z.uuid().describe("The id of the workflow type to fetch. Use list-workflow-types to find valid ids."),
};

const GetWorkflowTypeByIdTool = {
  name: "get-workflow-type-by-id",
  description:
    "Gets a single Umbraco Forms workflow type by its id, including its alias, name, " +
    "description, icon, group, full list of configurable settings, and whether it is " +
    "currently configured (isConfigured) with any configuration errors. Workflow types " +
    "are fixed system/package definitions, not user-created entities. Returns a " +
    "404-style error if the id does not match a known workflow type — use " +
    "list-workflow-types first if the id is unknown.",
  inputSchema,
  outputSchema: getWorkflowTypeByIdResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id }) => {
    return executeGetApiCall<ReturnType<ApiClient["getWorkflowTypeById"]>, ApiClient>((client) =>
      client.getWorkflowTypeById(id, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof getWorkflowTypeByIdResponse>;

export default withStandardDecorators(GetWorkflowTypeByIdTool);
