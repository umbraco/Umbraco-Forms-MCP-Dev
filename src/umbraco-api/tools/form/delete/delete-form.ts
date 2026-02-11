import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { deleteFormByIdParams } from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const DeleteFormTool: ToolDefinition<typeof deleteFormByIdParams.shape> = {
  name: "delete-form",
  description: "Permanently delete a form by its ID. This action cannot be undone. Check get-form-relations first to ensure the form is not in use by any content pages before deleting.",
  inputSchema: deleteFormByIdParams.shape,
  slices: ["delete"],
  annotations: {
    destructiveHint: true,
    idempotentHint: false,
  },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.deleteFormById(params.id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
};

export default withStandardDecorators(DeleteFormTool);
