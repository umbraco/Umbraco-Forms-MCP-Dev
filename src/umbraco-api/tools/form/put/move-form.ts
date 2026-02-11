import { z } from "zod";
import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = z.object({
  id: z.string().uuid().describe("The ID of the form to move"),
  parentId: z
    .string()
    .uuid()
    .nullable()
    .describe(
      "The destination folder ID. Set to null to move to the root level."
    ),
});

const MoveFormTool = {
  name: "move-form",
  description:
    "Move a form to a different folder. Provide the form ID and the target folder ID. Set parentId to null to move the form to the root level. Use get-form-tree to browse available folders.",
  inputSchema: inputSchema.shape,
  slices: ["move"],
  annotations: {
    idempotentHint: true,
  },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) =>
        client.putFormByIdMove(
          params.id,
          { parentId: params.parentId ?? null },
          CAPTURE_RAW_HTTP_RESPONSE
        )
    );
  },
} satisfies ToolDefinition<typeof inputSchema.shape, never>;

export default withStandardDecorators(MoveFormTool);
