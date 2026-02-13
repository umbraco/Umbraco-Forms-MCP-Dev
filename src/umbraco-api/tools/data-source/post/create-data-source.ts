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
  name: z.string().describe("Name for the new data source"),
  formDataSourceTypeId: z.string().describe("The UUID of the data source type. Use list-data-source-types or check available types first."),
  settings: z.record(z.string(), z.string()).optional().describe("Key-value settings for the data source configuration. Depends on the data source type."),
};

const outputSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const CreateDataSource = {
  name: "create-data-source",
  description: "Create a new form data source. Requires a name and data source type ID. Optionally provide settings as key-value pairs specific to the chosen type. The ID is generated automatically.",
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
      entityType: "FormDataSource",
      name: params.name,
      created: now,
      createdBy: null,
      createdByName: null,
      updated: now,
      updatedBy: null,
      updatedByName: null,
      settings: params.settings || {},
      formDataSourceTypeId: params.formDataSourceTypeId,
      valid: true,
    };

    const response = await client.postDataSource(body as any, CAPTURE_RAW_HTTP_RESPONSE);
    const locationHeader = (response as any)?.headers?.location || (response as any)?.headers?.Location;
    const createdId = locationHeader ? locationHeader.split("/").pop() : id;
    return createToolResult({ id: createdId, name: params.name });
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(CreateDataSource);
