/**
 * Copy Form Workflows Tool
 *
 * Copies specific workflows from one form onto another, existing form.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  postFormByIdCopyWorkflowsParams,
  postFormByIdCopyWorkflowsBody,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  ...postFormByIdCopyWorkflowsParams.shape,
  ...postFormByIdCopyWorkflowsBody.shape,
};

const CopyFormWorkflowsTool: ToolDefinition<typeof inputSchema> = {
  name: "copy-form-workflows",
  description:
    "Copies specific workflows (by workflowIds) from the source form (id) onto an existing destination form (destinationId). Both forms must already exist — use copy-form instead if you want to duplicate the whole form including its workflows into a new form.",
  inputSchema,
  slices: ["copy"],
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
  },
  handler: async ({ id, destinationId, workflowIds }) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.postFormByIdCopyWorkflows(
        id,
        { destinationId, workflowIds },
        CAPTURE_RAW_HTTP_RESPONSE,
      ),
    );
  },
};

export default withStandardDecorators(CopyFormWorkflowsTool);
