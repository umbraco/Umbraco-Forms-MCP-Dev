/**
 * Copy Form Tool
 *
 * Duplicates an existing form, optionally renaming it and/or placing the
 * copy in a different folder.
 */

import {
  withStandardDecorators,
  getApiClient,
  createToolResult,
  UmbracoApiError,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
  type HttpResponse,
  type ProblemDetails,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
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

const outputSchema = z.object({
  success: z.boolean(),
  id: z.string().describe("The id of the newly created copy."),
});

const CopyFormTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "copy-form",
  description:
    "Duplicates an existing form (identified by id) as a brand-new form with a server-generated ID. Optionally give the copy a new name and/or place it in a different folder via copyToFolderId; omit to copy into the same folder with an auto-generated name. Set copyWorkflows to true to also duplicate the form's workflows (submit/approve/reject actions) — use copy-form-workflows instead if you only want to add this form's workflows onto an already-existing form.",
  inputSchema,
  outputSchema,
  slices: ["copy"],
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
  },
  handler: async ({ id, newName, copyWorkflows, copyToFolderId }) => {
    const client = getApiClient<ApiClient>();
    const response = (await client.postFormByIdCopy(
      id,
      { newName, copyWorkflows, copyToFolderId },
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<ProblemDetails | void>;

    if (response.status < 200 || response.status >= 300) {
      throw new UmbracoApiError(
        (response.data as ProblemDetails) || {
          status: response.status,
          detail: response.statusText,
        },
      );
    }

    const location = response.headers?.Location || response.headers?.location;
    const newId = location?.split("/").pop();

    if (!newId) {
      throw new UmbracoApiError({
        status: response.status,
        detail: "Form was copied but no Location header was returned to identify the copy.",
      });
    }

    return createToolResult({ success: true, id: newId });
  },
};

export default withStandardDecorators(CopyFormTool);
