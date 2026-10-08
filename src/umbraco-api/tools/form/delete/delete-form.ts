/**
 * Delete Form Tool
 *
 * Deletes a form by its ID: moves it to the recycle bin on Umbraco Forms 18.2+,
 * deletes it permanently on earlier releases.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { deleteFormByIdParams } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = deleteFormByIdParams.shape;

const DeleteFormTool: ToolDefinition<typeof inputSchema> = {
  name: "delete-form",
  description:
    "Deletes an Umbraco Forms form by its ID. On Umbraco Forms 18.2 and later the form is moved to the Forms recycle bin, from where restore-form brings it back and delete-form-permanently removes it for good; earlier releases delete it permanently. It acts on the form definition, not its submitted entries. Use get-form-has-relations / get-form-relations first to check whether the form is referenced elsewhere (e.g. embedded on content pages) before deleting. Calling it on an ID that no longer exists returns a 404.",
  inputSchema,
  slices: ["delete"],
  annotations: {
    destructiveHint: true,
  },
  handler: async ({ id }) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.deleteFormById(id, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(DeleteFormTool);
