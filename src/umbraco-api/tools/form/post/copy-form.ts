/**
 * Copy Form Tool
 *
 * Duplicates an existing form, optionally renaming it and/or placing the
 * copy in a different folder.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  postFormByIdCopyParams,
  postFormByIdCopyBody,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  ...postFormByIdCopyParams.shape,
  ...postFormByIdCopyBody.shape,
};

const CopyFormTool: ToolDefinition<typeof inputSchema> = {
  name: "copy-form",
  description:
    "Duplicates an existing form (identified by id) as a brand-new form with a server-generated ID. Optionally give the copy a new name and/or place it in a different folder via copyToFolderId; omit to copy into the same folder with an auto-generated name. Set copyWorkflows to true to also duplicate the form's workflows (submit/approve/reject actions) — use copy-form-workflows instead if you only want to add this form's workflows onto an already-existing form.",
  inputSchema,
  slices: ["copy"],
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
  },
  handler: async ({ id, newName, copyWorkflows, copyToFolderId }) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.postFormByIdCopy(
        id,
        { newName, copyWorkflows, copyToFolderId },
        CAPTURE_RAW_HTTP_RESPONSE,
      ),
    );
  },
};

export default withStandardDecorators(CopyFormTool);
