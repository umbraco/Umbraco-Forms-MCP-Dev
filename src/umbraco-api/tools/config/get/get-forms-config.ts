import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getConfigResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetFormsConfigTool = {
  name: "get-forms-config",
  description:
    "Gets the Umbraco Forms back-office configuration: layout limits (max columns per form group), " +
    "security mode (whether security is managed via user groups), scheduled record deletion toggle, " +
    "mandatory fieldset legends toggle, allowed/disallowed file upload extensions, and feature flags " +
    "for multi-page form settings and advanced validation rules. " +
    "Use this to discover instance-wide Forms settings before creating or validating forms, fields, " +
    "or file-upload configuration. Does not accept parameters and is read-only — it does not change any settings.",
  inputSchema: {},
  outputSchema: getConfigResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getConfig"]>, ApiClient>(
      (client) => client.getConfig(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<{}, typeof getConfigResponse>;

export default withStandardDecorators(GetFormsConfigTool);
