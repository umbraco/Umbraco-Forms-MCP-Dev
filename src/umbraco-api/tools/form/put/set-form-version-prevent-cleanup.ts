/**
 * Set Form Version Prevent Cleanup Tool
 *
 * Protects a saved form version from (or releases it to) automatic version cleanup.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { putFormVersionByVersionIdPreventCleanupParams } from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { withFormsFeature } from "../../shared/forms-version.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  versionId: putFormVersionByVersionIdPreventCleanupParams.shape.versionId.describe(
    "ID of the version - a version ID from list-form-versions, not a form ID.",
  ),
  preventCleanup: z
    .boolean()
    .describe("true to keep this version through automatic cleanup, false to let cleanup remove it again."),
};

const SetFormVersionPreventCleanupTool: ToolDefinition<typeof inputSchema> = {
  name: "set-form-version-prevent-cleanup",
  description:
    "Protects a saved form version from automatic version cleanup, or removes that protection. Sites can be " +
    "configured to prune old form versions; a protected version is always kept. Use it to pin a known-good " +
    "version you may want to roll back to later.",
  inputSchema,
  slices: ["update"],
  annotations: {
    idempotentHint: true,
  },
  handler: async ({ versionId, preventCleanup }) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.putFormVersionByVersionIdPreventCleanup(
        versionId,
        { preventCleanup },
        CAPTURE_RAW_HTTP_RESPONSE,
      ),
    );
  },
};

export default withStandardDecorators(
  withFormsFeature("formVersions", SetFormVersionPreventCleanupTool),
);
