/**
 * List Forms Tool
 *
 * Paged listing of forms — the preferred way to browse forms in larger installations.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormCollectionQueryParams,
  getFormCollectionResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { withFormsFeature } from "../../shared/forms-version.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

// Forms 17.6/18.2 added a name `filter`; older releases ignore it and return every
// form, which would read as a filtered result. search-forms filters on every version.
const inputSchema = getFormCollectionQueryParams.omit({ filter: true }).shape;
const outputSchema = getFormCollectionResponse;

const ListFormsTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "list-forms",
  description:
    "Lists forms with paging support. Provide skip/take to page through results; omit both to get all forms in one page (default page size is very large). Returns each form's ID, name, field summary and entry count, plus the total count. Prefer this over list-all-forms when paging is needed, or search-forms when filtering by name.",
  inputSchema,
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ skip, take }) => {
    return executeGetApiCall<ReturnType<ApiClient["getFormCollection"]>, ApiClient>(
      (client) => client.getFormCollection({ skip, take }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(
  withFormsFeature(
    "formCollection",
    ListFormsTool,
    "list-all-forms lists every form on every version.",
  ),
);
