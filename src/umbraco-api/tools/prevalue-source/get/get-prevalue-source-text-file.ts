/**
 * Get Prevalue Source Text File Tool
 *
 * Downloads the raw text content of a named file associated with a prevalue
 * source (used by file-based providers, e.g. CSV-backed sources). Uses
 * manual handling because the API returns raw text rather than JSON, which
 * this tool wraps into a structured result.
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
  id: z.uuid().describe("ID of the prevalue source that owns the file."),
  fileName: z.string().min(1).describe("Name of the text file to download, as returned by the prevalue source's settings (e.g. an uploaded CSV file name)."),
};

const outputSchema = z.object({
  fileName: z.string(),
  content: z.string(),
});

const getPrevalueSourceTextFileTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-prevalue-source-text-file",
  description:
    "Downloads the raw text content of a file stored against a prevalue source (used by " +
    "file-based providers such as a CSV-backed source). Use this to inspect or debug the " +
    "underlying data a file-based prevalue source resolves options from.",
  inputSchema,
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id, fileName }) => {
    const client = getApiClient<ApiClient>();

    // The generated client types this as Blob (from the OpenAPI schema), but the
    // transport actually returns raw text for non-JSON content types at runtime.
    const response = (await client.getPrevalueSourceByIdTextFileByFileName(
      id,
      fileName,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as unknown as HttpResponse<string>;

    if (response.status < 200 || response.status >= 300) {
      throw new UmbracoApiError(
        (response.data as unknown as Record<string, unknown>) || {
          status: response.status,
          detail: response.statusText,
        },
      );
    }

    return createToolResult({ fileName, content: response.data ?? "" });
  },
};

export default withStandardDecorators(getPrevalueSourceTextFileTool);
