import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getAcceptanceTestsSystemInfoResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const GetAcceptanceTestsSystemInfoTool = {
  name: "get-acceptance-tests-system-info",
  description:
    "Gets host system information for the connected Umbraco Forms instance: operating system (Windows, Linux, macOS) and database engine (SQL Server or SQLite) flags. " +
    "Use this to check what platform and database the environment runs on before writing or reasoning about platform-specific acceptance tests. " +
    "Does not accept parameters and does not return version numbers — use a server info tool for that.",
  inputSchema: {},
  outputSchema: getAcceptanceTestsSystemInfoResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<
      ReturnType<ApiClient["getAcceptanceTestsSystemInfo"]>,
      ApiClient
    >((client) =>
      client.getAcceptanceTestsSystemInfo(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<{}, typeof getAcceptanceTestsSystemInfoResponse>;

export default withStandardDecorators(GetAcceptanceTestsSystemInfoTool);
