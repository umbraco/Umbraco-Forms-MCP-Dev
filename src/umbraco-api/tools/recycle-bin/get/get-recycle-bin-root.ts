/**
 * Get Recycle Bin Root Tool
 *
 * Lists the forms and folders at the top level of the Forms recycle bin.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getTreeRecycleBinRootResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { withFormsFeature } from "../../shared/forms-version.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const outputSchema = getTreeRecycleBinRootResponse;

const GetRecycleBinRootTool: ToolDefinition<undefined, typeof outputSchema> = {
  name: "get-recycle-bin-root",
  description:
    "Lists the forms and folders at the top level of the Forms recycle bin - the items deleted with delete-form or delete-folder. Returns every item, unpaged. " +
    "A trashed folder keeps its contents: use get-recycle-bin-children to look inside it. " +
    "Use restore-form/restore-folder to bring an item back, or delete-form-permanently/delete-folder-permanently to remove it for good.",
  outputSchema,
  slices: ["tree"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getTreeRecycleBinRoot"]>, ApiClient>(
      (client) => client.getTreeRecycleBinRoot(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(withFormsFeature("recycleBin", GetRecycleBinRootTool));
