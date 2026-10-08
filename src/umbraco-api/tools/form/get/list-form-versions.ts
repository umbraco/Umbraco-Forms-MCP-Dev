/**
 * List Form Versions Tool
 *
 * Lists the saved versions (history) of a form, most recent first.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormByIdVersionParams,
  getFormByIdVersionQueryParams,
  getFormByIdVersionResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { withFormsFeature } from "../../shared/forms-version.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: getFormByIdVersionParams.shape.id.describe("ID of the form whose version history to list."),
  ...getFormByIdVersionQueryParams.shape,
};
const outputSchema = getFormByIdVersionResponse;

const ListFormVersionsTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "list-form-versions",
  description:
    "Lists the saved versions of a form, most recent first: each version's ID, the form name at the time, when it " +
    "was saved and by which user, and whether it is protected from automatic cleanup. A version is stored every " +
    "time the form or its workflows change. Use get-form-version to see a version's full design, and " +
    "rollback-form-version to restore the form to it.",
  inputSchema,
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ id, skip, take }) => {
    return executeGetApiCall<ReturnType<ApiClient["getFormByIdVersion"]>, ApiClient>((client) =>
      client.getFormByIdVersion(id, { skip, take }, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(withFormsFeature("formVersions", ListFormVersionsTool));
