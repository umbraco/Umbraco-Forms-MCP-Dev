/**
 * Get Data Source Wizard Scaffold Tool
 *
 * Returns the default field-mapping wizard structure Umbraco Forms would use
 * to generate a new form from an existing data source (e.g. mapping SQL
 * columns to form fields). Read-only inspection step before
 * create-form-from-data-source.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getDatasourceWizardByIdScaffoldResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  dataSourceId: z
    .uuid()
    .describe("The id of an existing data source to build the wizard scaffold from. Use list-data-sources to find valid ids."),
};

const GetDataSourceWizardScaffoldTool = {
  name: "get-data-source-wizard-scaffold",
  description:
    "Gets the default field mappings Umbraco Forms proposes when generating a new form " +
    "from an existing data source's fields (e.g. SQL table columns or Umbraco member " +
    "properties), including which fields are included, their data types, and prevalue " +
    "settings. Use this to inspect the mappings before calling " +
    "create-form-from-data-source, which applies this scaffold automatically.",
  inputSchema,
  outputSchema: getDatasourceWizardByIdScaffoldResponse,
  slices: ["scaffold"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ dataSourceId }) => {
    return executeGetApiCall<ReturnType<ApiClient["getDatasourceWizardByIdScaffold"]>, ApiClient>((client) =>
      client.getDatasourceWizardByIdScaffold(dataSourceId, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema, typeof getDatasourceWizardByIdScaffoldResponse>;

export default withStandardDecorators(GetDataSourceWizardScaffoldTool);
