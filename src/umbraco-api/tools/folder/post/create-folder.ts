/**
 * Create Folder Tool
 *
 * Creates a new Umbraco Forms folder used to organise forms and data sources
 * in the Forms tree. Folders can be created at the root or nested under an
 * existing parent folder.
 */

import {
  withStandardDecorators,
  createToolResult,
  getApiClient,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
  type HttpResponse,
} from "@umbraco-cms/mcp-server-sdk";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

// The API requires a client-generated id up front. The LLM never supplies
// one — it's generated internally so the model only has to think about the
// folder's name and where it goes.
const inputSchema = {
  name: z.string().min(1).describe("Name of the folder to create."),
  parentId: z
    .uuid()
    .optional()
    .describe(
      "ID of an existing parent folder to create this folder under. Omit to create the folder at the root of the Forms tree.",
    ),
};

const outputSchema = z.object({
  success: z.boolean(),
  id: z.string().describe("The generated ID of the newly created folder."),
  name: z.string(),
  parentId: z.string().nullish(),
});

const CreateFolderTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "create-folder",
  description:
    "Creates a new Forms folder, optionally nested beneath an existing parent folder. " +
    "Use this to organise forms and data sources into a tree structure. Omit parentId " +
    "to create the folder at the root. Does not accept a folder ID from the caller — " +
    "one is generated automatically and returned in the response.",
  inputSchema,
  outputSchema,
  slices: ["create"],
  annotations: { destructiveHint: false, idempotentHint: false },
  handler: async ({ name, parentId }) => {
    const id = randomUUID();
    const payload = {
      id,
      name,
      parentId: parentId ?? null,
    };

    const client = getApiClient<ApiClient>();
    const response = (await client.postFolder(
      payload,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as unknown as HttpResponse;

    if (response.status < 200 || response.status >= 300) {
      return createToolResult({
        success: false,
        id,
        name,
        parentId: parentId ?? null,
      });
    }

    return createToolResult({
      success: true,
      id,
      name,
      parentId: parentId ?? null,
    });
  },
};

export default withStandardDecorators(CreateFolderTool);
