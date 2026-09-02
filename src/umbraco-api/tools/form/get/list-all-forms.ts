/**
 * List All Forms Tool
 *
 * Lightweight, unpaged listing of every form in the installation.
 */

import { z } from "zod";
import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getFormResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const outputSchema = z.object({ items: getFormResponse });

const ListAllFormsTool: ToolDefinition<undefined, typeof outputSchema> = {
  name: "list-all-forms",
  description:
    "Lists every form in the Umbraco Forms installation with basic info (ID, name, field summary, entry count). This is an unpaged legacy listing — for large installations or when you need paging/searching, prefer list-forms or search-forms instead.",
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getForm"]>, ApiClient>(
      (client) => client.getForm(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(ListAllFormsTool);
