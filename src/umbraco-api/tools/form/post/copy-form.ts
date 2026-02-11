import { z } from "zod";
import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: z.string().uuid().describe("The ID of the form to copy"),
  newName: z
    .string()
    .optional()
    .describe(
      "Name for the copied form. If omitted, the original name is used with a copy suffix."
    ),
  copyWorkflows: z
    .boolean()
    .default(true)
    .describe("Whether to copy the form's workflows to the new form"),
  copyToFolderId: z
    .string()
    .uuid()
    .optional()
    .describe(
      "Target folder ID. If omitted, copies to the same folder as the original."
    ),
};

const outputSchema = z.object({
  success: z.boolean(),
});

const CopyFormTool = {
  name: "copy-form",
  description:
    "Copy an existing form to create a new one. Optionally specify a new name, whether to include workflows, and a destination folder. Use list-forms first to find the source form ID. If no name is given, a copy suffix is added automatically. Note: The API does not return the new form's ID. Use list-forms after copying to find the new form by name.",
  inputSchema,
  outputSchema,
  slices: ["copy"],
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
  },
  handler: async (params) => {
    return executeVoidApiCall<ApiClient>(
      (client) =>
        client.postFormByIdCopy(
          params.id,
          {
            newName: params.newName ?? null,
            copyWorkflows: params.copyWorkflows ?? true,
            copyToFolderId: params.copyToFolderId ?? null,
          },
          CAPTURE_RAW_HTTP_RESPONSE
        )
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(CopyFormTool);
