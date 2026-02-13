import { z } from "zod";
import {
  withStandardDecorators,
  getApiClient,
  createToolResult,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { v4 as uuid } from "uuid";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  name: z.string().describe("Name for the new prevalue source"),
  fieldPreValueSourceTypeId: z.string().describe("The UUID of the prevalue source type. Use list-prevalue-source-types or check available types first."),
  settings: z.record(z.string(), z.string()).optional().describe("Key-value settings for the prevalue source configuration. Depends on the prevalue source type."),
  cachePrevaluesFor: z.string().optional().default("0").describe("Duration to cache prevalue results (e.g., '0' for no cache, '60' for 60 seconds)"),
};

const outputSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const CreatePrevalueSource = {
  name: "create-prevalue-source",
  description: "Create a new prevalue source for form field options. Requires a name and prevalue source type ID. Optionally provide settings as key-value pairs and cache duration. The ID is generated automatically.",
  inputSchema,
  outputSchema,
  slices: ["create"],
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
  },
  handler: async (params) => {
    const client = getApiClient<ApiClient>();
    const id = uuid();
    const now = new Date().toISOString();

    const body = {
      id,
      unique: uuid(),
      entityType: "FieldPreValueSource",
      name: params.name,
      created: now,
      createdBy: null,
      createdByName: null,
      updated: now,
      updatedBy: null,
      updatedByName: null,
      settings: params.settings || {},
      fieldPreValueSourceTypeId: params.fieldPreValueSourceTypeId,
      cachePrevaluesFor: params.cachePrevaluesFor || "0",
      valid: true,
    };

    const response = await client.postPrevalueSource(body as any, CAPTURE_RAW_HTTP_RESPONSE);
    const locationHeader = (response as any)?.headers?.location || (response as any)?.headers?.Location;
    const createdId = locationHeader ? locationHeader.split("/").pop() : id;
    return createToolResult({ id: createdId, name: params.name });
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(CreatePrevalueSource);
