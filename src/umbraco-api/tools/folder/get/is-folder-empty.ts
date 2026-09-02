/**
 * Is Folder Empty Tool
 *
 * Checks whether an Umbraco Forms folder contains any forms, data sources, or
 * subfolders. Useful before deleting a folder, since deletion typically
 * expects the folder to be empty.
 */

import {
  withStandardDecorators,
  createToolResult,
  getApiClient,
  UmbracoApiError,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
  type HttpResponse,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: z.uuid().describe("ID of the folder to check."),
};

const outputSchema = z.object({
  isEmpty: z.boolean().describe("True if the folder contains no items or subfolders."),
});

const IsFolderEmptyTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "is-folder-empty",
  description:
    "Checks whether a Forms folder is empty (no forms, data sources, or subfolders inside it). " +
    "Use this before calling delete-folder to confirm the folder can be safely removed.",
  inputSchema,
  outputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async ({ id }) => {
    const client = getApiClient<ApiClient>();
    const response = (await client.getFolderByIdIsEmpty(
      id,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as unknown as HttpResponse<boolean>;

    if (response.status < 200 || response.status >= 300) {
      throw new UmbracoApiError(
        (response.data as unknown as { status: number; detail?: string }) ?? {
          status: response.status,
          detail: response.statusText,
        },
      );
    }

    return createToolResult({ isEmpty: Boolean(response.data) });
  },
};

export default withStandardDecorators(IsFolderEmptyTool);
