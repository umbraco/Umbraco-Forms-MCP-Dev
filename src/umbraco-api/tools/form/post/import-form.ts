/**
 * Import Form Tool
 *
 * Creates a new form from a previously uploaded form export file.
 */

import { z } from "zod";
import {
  withStandardDecorators,
  createToolResult,
  getApiClient,
  UmbracoApiError,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
  type HttpResponse,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { postFormImportBody } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = postFormImportBody.shape;

const outputSchema = z.object({
  id: z.string().describe("The ID of the newly created form."),
});

const ImportFormTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "import-form",
  description:
    "Creates a new form by importing a previously uploaded form export file. Requires the fileKey of an already-uploaded .uform export file (uploading the file itself is not part of this API) — this tool cannot import a form design object directly, use create-form for that. Optionally places the imported form in a folder via folderId. Returns the new form's ID.",
  inputSchema,
  outputSchema,
  slices: ["import"],
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
  },
  handler: async ({ fileKey, folderId }) => {
    const client = getApiClient<ApiClient>();
    const response = (await client.postFormImport(
      { fileKey, folderId },
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as unknown as HttpResponse<string>;

    if (response.status >= 200 && response.status < 300) {
      return createToolResult({ id: response.data });
    }

    const errorData = (response.data as unknown as Record<string, unknown>) || {
      status: response.status,
      detail: response.statusText,
    };
    throw new UmbracoApiError(errorData);
  },
};

export default withStandardDecorators(ImportFormTool);
