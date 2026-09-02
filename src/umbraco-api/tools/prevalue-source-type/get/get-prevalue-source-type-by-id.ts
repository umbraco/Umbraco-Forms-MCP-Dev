/**
 * Get Prevalue Source Type By Id Tool
 *
 * Fetches a single prevalue source type built into Umbraco Forms by its id,
 * including its configurable settings.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getPrevalueSourceTypeByIdParams,
  getPrevalueSourceTypeByIdResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetPrevalueSourceTypeByIdTool = {
  name: "get-prevalue-source-type-by-id",
  description:
    "Gets a single prevalue source type built into Umbraco Forms by its id, " +
    "including its unique id, entity type, alias, name, description, icon, and " +
    "available settings. Prevalue source types are fixed system definitions (e.g. " +
    "Static Values, Values from a Sheet, Values from a Member Property Editor, " +
    "Umbraco content nodes) that describe where a prevalue source gets its values " +
    "from — they are not created or edited by users. Use this when you already know " +
    "the prevalue source type id and need its details/settings; use " +
    "list-prevalue-source-types instead to discover ids or browse all available types.",
  inputSchema: {
    id: getPrevalueSourceTypeByIdParams.shape.id.describe(
      "ID of the prevalue source type to fetch. Use list-prevalue-source-types to find valid ids.",
    ),
  },
  outputSchema: getPrevalueSourceTypeByIdResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id }) => {
    return executeGetApiCall<ReturnType<ApiClient["getPrevalueSourceTypeById"]>, ApiClient>(
      (client) => client.getPrevalueSourceTypeById(id, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<
  typeof getPrevalueSourceTypeByIdParams.shape,
  typeof getPrevalueSourceTypeByIdResponse
>;

export default withStandardDecorators(GetPrevalueSourceTypeByIdTool);
