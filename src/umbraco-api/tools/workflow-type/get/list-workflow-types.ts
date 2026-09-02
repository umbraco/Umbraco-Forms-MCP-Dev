/**
 * List Workflow Types Tool
 *
 * Lists all workflow types available in Umbraco Forms (e.g. Send Email, Send to URL,
 * Add to Umbraco Members group) together with their settings and configuration status.
 */

import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getWorkflowTypeResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const outputSchema = z.object({ items: getWorkflowTypeResponse });

const ListWorkflowTypesTool = {
  name: "list-workflow-types",
  description:
    "Lists every workflow type available in Umbraco Forms (built-in ones like Send Email, " +
    "Send to URL, or Add to Umbraco Members Group, plus any installed via packages), " +
    "including each one's id, alias, name, description, icon, group, configurable settings, " +
    "and whether it is currently configured (isConfigured) with any configuration errors. " +
    "Workflow types are fixed system/package definitions — they are not created or edited by " +
    "users. Use this to discover which workflow type ids/aliases are available and what " +
    "settings each one supports before adding a workflow to a form.",
  inputSchema: {},
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getWorkflowType"]>, ApiClient>((client) =>
      client.getWorkflowType(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<Record<string, never>, typeof outputSchema>;

export default withStandardDecorators(ListWorkflowTypesTool);
