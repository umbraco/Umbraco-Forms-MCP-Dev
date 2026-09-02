/**
 * Get Licensing Status Tool
 *
 * Fetches the current Umbraco Forms license status, including trial/validity
 * state, any license limitations, and the domains the license is valid for.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getLicensingStatusResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const outputSchema = getLicensingStatusResponse;

const GetLicensingStatusTool: ToolDefinition<Record<string, never>, typeof outputSchema> = {
  name: "get-licensing-status",
  description:
    "Gets the current Umbraco Forms license status: whether it is a trial, whether the license is valid, any license limitations, and the list of domains the license is valid for. Takes no parameters. Use this to check licensing before relying on features that may be restricted by the license, or to diagnose license-related errors — not a substitute for the Umbraco Cloud subscription/billing portal.",
  inputSchema: {},
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getLicensingStatus"]>, ApiClient>(
      (client) => client.getLicensingStatus(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(GetLicensingStatusTool);
