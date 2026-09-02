/**
 * Move Form Tool
 *
 * Moves a form to a different folder, or to the root of the Forms tree.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  putFormByIdMoveParams,
  putFormByIdMoveBody,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  ...putFormByIdMoveParams.shape,
  ...putFormByIdMoveBody.shape,
};

const MoveFormTool: ToolDefinition<typeof inputSchema> = {
  name: "move-form",
  description:
    "Moves a form (id) into a different folder (parentId). Omit parentId to move the form to the root of the Forms tree. Use this instead of update-form when only relocating a form — no other design changes are made.",
  inputSchema,
  slices: ["move"],
  annotations: {
    idempotentHint: true,
  },
  handler: async ({ id, parentId }) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.putFormByIdMove(id, { parentId }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(MoveFormTool);
