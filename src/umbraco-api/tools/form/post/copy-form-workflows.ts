import { z } from "zod";
import {
  withStandardDecorators,
  getApiClient,
  createToolResult,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: z
    .string()
    .uuid()
    .describe(
      "The source form ID to copy workflows from. Use list-forms to find form IDs."
    ),
  destinationId: z
    .string()
    .uuid()
    .describe("The target form ID to copy workflows to."),
};

const outputSchema = z.object({
  success: z.boolean(),
  workflowsCopied: z.number(),
});

const CopyFormWorkflowsTool = {
  name: "copy-form-workflows",
  description:
    "Copy all workflows from one form to another. Automatically fetches all workflow IDs from the source form (onSubmit, onApprove, onReject) and copies them to the destination form. Only requires the source and destination form IDs.",
  inputSchema,
  outputSchema,
  slices: ["copy"],
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
  },
  handler: async (params) => {
    const client = getApiClient<ApiClient>();

    // Fetch source form to get all workflow IDs
    const sourceForm = await client.getFormById(params.id);
    const workflows = (sourceForm as any).formWorkflows || {
      onSubmit: [],
      onApprove: [],
      onReject: [],
    };
    const workflowIds = [
      ...workflows.onSubmit.map((w: any) => w.id),
      ...workflows.onApprove.map((w: any) => w.id),
      ...workflows.onReject.map((w: any) => w.id),
    ];

    if (workflowIds.length === 0) {
      return createToolResult({ success: true, workflowsCopied: 0 });
    }

    await client.postFormByIdCopyWorkflows(
      params.id,
      {
        destinationId: params.destinationId,
        workflowIds,
      },
      CAPTURE_RAW_HTTP_RESPONSE
    );
    return createToolResult({
      success: true,
      workflowsCopied: workflowIds.length,
    });
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(CopyFormWorkflowsTool);
