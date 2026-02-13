import { z } from "zod";
import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getTreeFormAncestorsResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = z.object({
  descendantId: z
    .string()
    .uuid()
    .describe(
      "The ID of a form or folder to get ancestors for. Returns all parent folders up to the root."
    ),
});

const outputSchema = z.object({ items: getTreeFormAncestorsResponse });

const GetFormTreeAncestors = {
  name: "get-form-tree-ancestors",
  description:
    "Get the ancestor tree path for a form or folder. Returns all parent folders from the given item up to the root. Useful for understanding where a form sits in the folder hierarchy.",
  inputSchema: inputSchema.shape,
  outputSchema: outputSchema,
  slices: ["tree"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetItemsApiCall<
      ReturnType<ApiClient["getTreeFormAncestors"]>,
      ApiClient
    >(
      (client) =>
        client.getTreeFormAncestors(
          { descendantId: params.descendantId },
          CAPTURE_RAW_HTTP_RESPONSE
        )
    );
  },
} satisfies ToolDefinition<typeof inputSchema.shape, typeof outputSchema>;

export default withStandardDecorators(GetFormTreeAncestors);
