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
  id: z.string().uuid().describe("The ID of the form to update. Use list-forms or get-form-tree to find form IDs."),
  name: z.string().optional().describe("New name for the form"),
  messageOnSubmit: z.string().optional().describe("Message shown after form submission"),
  submitLabel: z.string().optional().describe("Label for the submit button"),
};

const outputSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const UpdateFormTool = {
  name: "update-form",
  description: "Update basic form properties (name, submit message, submit button label). Fetches the current form state, applies your changes, and saves. Only provide fields you want to modify. Does not modify form structure (pages, fields, workflows). Use get-form first to see current values.",
  inputSchema,
  outputSchema,
  slices: ["update"],
  annotations: {
    idempotentHint: true,
  },
  handler: async (params) => {
    const client = getApiClient<ApiClient>();

    // Fetch existing form
    const existing = await client.getFormById(params.id);

    // Merge changes
    const updated = {
      ...existing,
      ...(params.name !== undefined ? { name: params.name } : {}),
      ...(params.messageOnSubmit !== undefined ? { messageOnSubmit: params.messageOnSubmit } : {}),
      ...(params.submitLabel !== undefined ? { submitLabel: params.submitLabel } : {}),
      updated: new Date().toISOString(),
    };

    await client.putFormById(params.id, updated as any, CAPTURE_RAW_HTTP_RESPONSE);
    return createToolResult({ id: params.id, name: updated.name });
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(UpdateFormTool);
