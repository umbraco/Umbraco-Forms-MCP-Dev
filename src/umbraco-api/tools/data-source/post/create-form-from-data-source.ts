/**
 * Create Form From Data Source Tool
 *
 * Generates a brand-new Umbraco Forms form from an existing data source (e.g.
 * a SQL table or Umbraco member type), using the data source's default field
 * mappings so the caller only has to name the form.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  getApiClient,
  UmbracoApiError,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
  type HttpResponse,
  type ProblemDetails,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type {
  getUmbracoFormsManagementAPI,
  DataSourceWizard,
} from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  dataSourceId: z
    .uuid()
    .describe("The id of an existing data source to generate the form from. Use list-data-sources to find valid ids."),
  formName: z.string().min(1).describe("Name for the new form that will be generated."),
};

const CreateFormFromDataSourceTool = {
  name: "create-form-from-data-source",
  description:
    "Creates a new Umbraco Forms form whose fields are generated automatically from an " +
    "existing data source's structure (e.g. one field per SQL column). Uses the data " +
    "source's default field mappings from get-data-source-wizard-scaffold — inspect that " +
    "tool first if you need to know which fields will be included before generating the " +
    "form. Requires an existing data source id; it does not create a data source.",
  inputSchema,
  slices: ["create"],
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
  },
  handler: async ({ dataSourceId, formName }) => {
    const client = getApiClient<ApiClient>();

    const scaffoldResponse = (await client.getDatasourceWizardByIdScaffold(
      dataSourceId,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<DataSourceWizard | ProblemDetails>;

    if (scaffoldResponse.status < 200 || scaffoldResponse.status >= 300) {
      throw new UmbracoApiError(scaffoldResponse.data as ProblemDetails);
    }

    const scaffold = scaffoldResponse.data as DataSourceWizard;

    const payload: DataSourceWizard = {
      ...scaffold,
      dataSourceGuid: dataSourceId,
      formName,
    };

    return executeVoidApiCall<ApiClient>((client) =>
      client.postDatasourceWizardCreateForm(payload, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(CreateFormFromDataSourceTool);
