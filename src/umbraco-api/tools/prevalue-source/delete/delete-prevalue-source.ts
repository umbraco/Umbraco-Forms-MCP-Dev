import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { deletePrevalueSourceByIdParams } from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const DeletePrevalueSourceTool: ToolDefinition<typeof deletePrevalueSourceByIdParams.shape> = {
  name: "delete-prevalue-source",
  description: "Permanently delete a prevalue source by its ID. This action cannot be undone. Ensure the prevalue source is not in use by any form fields before deleting.",
  inputSchema: deletePrevalueSourceByIdParams.shape,
  slices: ["delete"],
  annotations: {
    destructiveHint: true,
  },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.deletePrevalueSourceById(params.id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
};

export default withStandardDecorators(DeletePrevalueSourceTool);
