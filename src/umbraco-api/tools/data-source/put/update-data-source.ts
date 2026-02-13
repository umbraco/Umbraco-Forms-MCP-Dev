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
  id: z.string().describe("The unique ID of the data source to update"),
  name: z.string().optional().describe("New name for the data source"),
  formDataSourceTypeId: z.string().optional().describe("New data source type ID"),
  settings: z.record(z.string(), z.string()).optional().describe("Updated settings as key-value pairs. Replaces existing settings."),
};

const outputSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const UpdateDataSourceTool = {
  name: "update-data-source",
  description: "Update an existing form data source. Provide the data source ID and any fields to change. Fetches the current state first, then applies your changes. Only provide fields you want to modify.",
  inputSchema,
  outputSchema,
  slices: ["update"],
  annotations: {
    idempotentHint: true,
  },
  handler: async (params) => {
    const client = getApiClient<ApiClient>();

    // Fetch existing data source
    const existing = await client.getDataSourceById(params.id);

    // Merge changes
    const updated = {
      ...existing,
      ...(params.name !== undefined ? { name: params.name } : {}),
      ...(params.formDataSourceTypeId !== undefined ? { formDataSourceTypeId: params.formDataSourceTypeId } : {}),
      ...(params.settings !== undefined ? { settings: params.settings } : {}),
      updated: new Date().toISOString(),
    };

    await client.putDataSourceById(params.id, updated as any, CAPTURE_RAW_HTTP_RESPONSE);
    return createToolResult({ id: params.id, name: updated.name });
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(UpdateDataSourceTool);
