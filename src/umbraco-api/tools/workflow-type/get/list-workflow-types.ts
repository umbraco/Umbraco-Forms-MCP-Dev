import * as zod from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getWorkflowTypeResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const emptyInput = zod.object({});

const ListWorkflowTypes = {
  name: "list-workflow-types",
  description:
    "List all available workflow type definitions. Workflow types define what kinds of post-submission workflows can be attached to forms (e.g., Send Email, Post as XML, Save as Umbraco Content Node). Each type includes its group, configuration settings schema, and description. Returns all installed workflow types. Use this to discover what workflow types are available when configuring form submission workflows.",
  inputSchema: emptyInput.shape,
  outputSchema: getWorkflowTypeResponse,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getWorkflowType"]>, ApiClient>(
      (client) => client.getWorkflowType(CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof emptyInput.shape, typeof getWorkflowTypeResponse>;

export default withStandardDecorators(ListWorkflowTypes);
