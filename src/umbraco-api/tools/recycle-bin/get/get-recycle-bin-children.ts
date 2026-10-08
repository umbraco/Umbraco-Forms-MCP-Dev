/**
 * Get Recycle Bin Children Tool
 *
 * Lists the forms and folders inside a trashed folder in the Forms recycle bin.
 */

import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getTreeRecycleBinChildrenByParentIdParams,
  getTreeRecycleBinChildrenByParentIdResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { withFormsFeature } from "../../shared/forms-version.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  parentId: getTreeRecycleBinChildrenByParentIdParams.shape.parentId.describe(
    "ID of a trashed folder, from get-recycle-bin-root or an earlier get-recycle-bin-children call.",
  ),
};
const outputSchema = z.object({ items: getTreeRecycleBinChildrenByParentIdResponse });

const GetRecycleBinChildrenTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-recycle-bin-children",
  description:
    "Lists every form and folder directly inside a trashed folder in the Forms recycle bin. " +
    "Start from get-recycle-bin-root. Restoring the folder (restore-folder) brings all of these back with it.",
  inputSchema,
  outputSchema,
  slices: ["tree"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ parentId }) => {
    return executeGetItemsApiCall<
      ReturnType<ApiClient["getTreeRecycleBinChildrenByParentId"]>,
      ApiClient
    >((client) => client.getTreeRecycleBinChildrenByParentId(parentId, CAPTURE_RAW_HTTP_RESPONSE));
  },
};

export default withStandardDecorators(withFormsFeature("recycleBin", GetRecycleBinChildrenTool));
