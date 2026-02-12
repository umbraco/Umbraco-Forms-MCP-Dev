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
  id: z.string().uuid().describe("The unique ID of the prevalue source to update"),
  name: z.string().optional().describe("New name for the prevalue source"),
  fieldPreValueSourceTypeId: z.string().uuid().optional().describe("New prevalue source type ID"),
  settings: z.record(z.string(), z.string()).optional().describe("Updated settings as key-value pairs. Replaces existing settings."),
  cachePrevaluesFor: z.string().optional().describe("New cache duration (e.g., '0' for no cache, '60' for 60 seconds)"),
};

const outputSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

const UpdatePrevalueSourceTool = {
  name: "update-prevalue-source",
  description: "Update an existing prevalue source. Provide the prevalue source ID and any fields to change. Fetches the current state first, then applies your changes. Only provide fields you want to modify.",
  inputSchema,
  outputSchema,
  slices: ["update"],
  annotations: {
    idempotentHint: true,
  },
  handler: async (params) => {
    const client = getApiClient<ApiClient>();

    // Fetch existing prevalue source
    const existing = await client.getPrevalueSourceById(params.id);

    // Merge changes
    const updated = {
      ...existing,
      ...(params.name !== undefined ? { name: params.name } : {}),
      ...(params.fieldPreValueSourceTypeId !== undefined ? { fieldPreValueSourceTypeId: params.fieldPreValueSourceTypeId } : {}),
      ...(params.settings !== undefined ? { settings: params.settings } : {}),
      ...(params.cachePrevaluesFor !== undefined ? { cachePrevaluesFor: params.cachePrevaluesFor } : {}),
      updated: new Date().toISOString(),
    };

    await client.putPrevalueSourceById(params.id, updated as any, CAPTURE_RAW_HTTP_RESPONSE);
    return createToolResult({ id: params.id, name: updated.name });
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(UpdatePrevalueSourceTool);
