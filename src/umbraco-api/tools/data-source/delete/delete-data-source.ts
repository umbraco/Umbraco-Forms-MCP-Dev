import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { deleteDataSourceByIdParams } from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const DeleteDataSourceTool: ToolDefinition<typeof deleteDataSourceByIdParams.shape> = {
  name: "delete-data-source",
  description: "Permanently delete a form data source by its ID. This action cannot be undone. Ensure the data source is not in use by any forms before deleting.",
  inputSchema: deleteDataSourceByIdParams.shape,
  slices: ["delete"],
  annotations: {
    destructiveHint: true,
  },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) => client.deleteDataSourceById(params.id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
};

export default withStandardDecorators(DeleteDataSourceTool);
