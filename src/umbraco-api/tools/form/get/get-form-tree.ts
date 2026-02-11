import { z } from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getTreeFormRootResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = z.object({
  parentId: z
    .string()
    .uuid()
    .optional()
    .describe("Folder ID to get children of. Omit to get root level forms and folders."),
});

const GetFormTree = {
  name: "get-form-tree",
  description:
    "Browse the form tree hierarchy. Returns forms and folders at the specified level. Without parentId, returns root level items. With parentId (a folder ID), returns that folder's children. Each item shows if it has children for further navigation.",
  inputSchema: inputSchema.shape,
  outputSchema: getTreeFormRootResponse,
  slices: ["tree"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    if (params.parentId) {
      return executeGetApiCall<
        ReturnType<ApiClient["getTreeFormChildrenByParentId"]>,
        ApiClient
      >(
        (client) =>
          client.getTreeFormChildrenByParentId(
            params.parentId!,
            undefined,
            CAPTURE_RAW_HTTP_RESPONSE
          )
      );
    }
    return executeGetApiCall<
      ReturnType<ApiClient["getTreeFormRoot"]>,
      ApiClient
    >((client) => client.getTreeFormRoot(undefined, CAPTURE_RAW_HTTP_RESPONSE));
  },
} satisfies ToolDefinition<typeof inputSchema.shape, typeof getTreeFormRootResponse>;

export default withStandardDecorators(GetFormTree);
