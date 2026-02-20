import { z } from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getDataSourceScaffoldResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const emptyInput = z.object({});

// Relax formDataSourceTypeId from uuid() to string() — the API can return non-UUID type IDs
const outputSchema = getDataSourceScaffoldResponse.extend({
  formDataSourceTypeId: z.string(),
});

const GetDataSourceScaffold = {
  name: "get-data-source-scaffold",
  description:
    "Gets an empty data source scaffold with default values. Returns the structure needed to create a new data source, including default settings and required fields. Use this to understand the data source structure before calling create-data-source.",
  inputSchema: emptyInput.shape,
  outputSchema,
  slices: ["scaffolding"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getDataSourceScaffold"]>, ApiClient>(
      (client) => client.getDataSourceScaffold(CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof emptyInput.shape, typeof outputSchema>;

export default withStandardDecorators(GetDataSourceScaffold);
