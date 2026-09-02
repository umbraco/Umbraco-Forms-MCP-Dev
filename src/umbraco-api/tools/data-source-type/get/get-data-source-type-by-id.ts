/**
 * Get Data Source Type By Id Tool
 *
 * Calls GET /umbraco/forms/management/api/v1/data-source-type/{id}
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getDataSourceTypeByIdParams,
  getDataSourceTypeByIdResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetDataSourceTypeByIdTool = {
  name: "get-data-source-type-by-id",
  description:
    "Gets a single data source type from Umbraco Forms by its unique id, returning its alias, name, description, icon, and the settings schema (name, alias, prevalues, view, display order, default value, read-only/mandatory flags) that a data source of this type expects. Data source types are read-only entities defined by code/installed packages, not user-created data — this tool cannot create, update, or delete them. Use this when you already know the id (e.g. from list-data-source-types or from a data source's formDataSourceTypeId) and need its full settings definition. If you don't have the id yet, call list-data-source-types first.",
  inputSchema: getDataSourceTypeByIdParams.shape,
  outputSchema: getDataSourceTypeByIdResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id }) => {
    return executeGetApiCall<ReturnType<ApiClient["getDataSourceTypeById"]>, ApiClient>(
      (client) => client.getDataSourceTypeById(id, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof getDataSourceTypeByIdParams.shape, typeof getDataSourceTypeByIdResponse>;

export default withStandardDecorators(GetDataSourceTypeByIdTool);
