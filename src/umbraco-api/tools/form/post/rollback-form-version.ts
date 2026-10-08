/**
 * Rollback Form Version Tool
 *
 * Restores a form's design and workflows to a saved version.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { postFormVersionByVersionIdRollbackParams } from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { withFormsFeature } from "../../shared/forms-version.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  versionId: postFormVersionByVersionIdRollbackParams.shape.versionId.describe(
    "ID of the version to roll back to - a version ID from list-form-versions, not a form ID.",
  ),
};

const RollbackFormVersionTool: ToolDefinition<typeof inputSchema> = {
  name: "rollback-form-version",
  description:
    "Rolls a form back to a saved version, replacing its current design and workflows with the ones captured in " +
    "that version. The rollback is saved as a new version, so the state it replaced stays in the history. Use " +
    "list-form-versions to find the version and get-form-version to check it first. Fails for a form in the " +
    "recycle bin - restore it first. Each call saves another version; to undo a rollback, roll back to the " +
    "version listed just below the new one. Confirm with the user before calling it.",
  inputSchema,
  slices: ["update"],
  annotations: {
    destructiveHint: false,
  },
  handler: async ({ versionId }) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.postFormVersionByVersionIdRollback(versionId, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(withFormsFeature("formVersions", RollbackFormVersionTool));
