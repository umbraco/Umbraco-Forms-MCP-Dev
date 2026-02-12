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
  name: z.string().min(1).describe("Name for the new folder"),
  parentId: z.string().uuid().optional().describe("UUID of the parent folder. Omit to create at root level."),
};

const outputSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

const CreateFolder = {
  name: "create-folder",
  description: "Create a new folder for organizing forms. Provide a name and optionally a parent folder ID to create nested folders. The folder ID is generated automatically. Use this to organize forms into logical groups.",
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

    const body = {
      id,
      name: params.name,
      parentId: params.parentId || null,
    };

    const response = await client.postFolder(body, CAPTURE_RAW_HTTP_RESPONSE);
    const locationHeader = (response as any)?.headers?.location || (response as any)?.headers?.Location;
    const createdId = locationHeader ? locationHeader.split("/").pop() : id;
    return createToolResult({ id: createdId, name: params.name });
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(CreateFolder);
