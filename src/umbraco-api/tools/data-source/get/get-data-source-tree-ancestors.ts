import { z } from "zod";
import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getTreeDataSourceAncestorsQueryParams,
  getTreeDataSourceAncestorsResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const outputSchema = z.object({ items: getTreeDataSourceAncestorsResponse });

const GetDataSourceTreeAncestors = {
  name: "get-data-source-tree-ancestors",
  description:
    "Gets the ancestor tree path for a data source or folder up to the root. Returns the hierarchy of parent items. Provide a descendant ID to see its full path in the tree. If descendantId is omitted, returns an empty array.",
  inputSchema: getTreeDataSourceAncestorsQueryParams.shape,
  outputSchema: outputSchema,
  slices: ["tree"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    return executeGetItemsApiCall<
      ReturnType<ApiClient["getTreeDataSourceAncestors"]>,
      ApiClient
    >(
      (client) =>
        client.getTreeDataSourceAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<
  typeof getTreeDataSourceAncestorsQueryParams.shape,
  typeof outputSchema
>;

export default withStandardDecorators(GetDataSourceTreeAncestors);
