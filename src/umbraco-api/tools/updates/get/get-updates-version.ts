/**
 * Get Updates Version Tool
 *
 * Checks Umbraco Forms for an available newer version by comparing the
 * currently installed version against the latest published release.
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

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const outputSchema = z.object({
  version: z.string(),
});

const GetUpdatesVersionTool: ToolDefinition<Record<string, never>, typeof outputSchema> = {
  name: "get-updates-version",
  description:
    "Checks for available Umbraco Forms version updates and returns the latest available version string. Takes no parameters. Use this to see if a newer Umbraco Forms release exists — it does not install or trigger any update, and does not report the currently installed version.",
  inputSchema: {},
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    // The API returns a bare version string (getUpdatesVersionResponse is
    // `zod.string()`), not an object — executeGetApiCall would pass that
    // straight through as structuredContent and fail the tool's own
    // z.object({ version }) outputSchema at the MCP protocol layer. Handle
    // it manually so the response can be wrapped to match the schema.
    const client = getApiClient<ApiClient>();
    const response = (await client.getUpdatesVersion(
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as unknown as HttpResponse<string>;

    if (response.status < 200 || response.status >= 300) {
      throw new UmbracoApiError(
        (response.data as unknown as { status: number; detail?: string }) ?? {
          status: response.status,
          detail: response.statusText,
        },
      );
    }

    return createToolResult({ version: response.data });
  },
};

export default withStandardDecorators(GetUpdatesVersionTool);
