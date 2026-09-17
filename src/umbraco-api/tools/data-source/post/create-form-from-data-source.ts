/**
 * Create Form From Data Source Tool
 *
 * Generates a brand-new Umbraco Forms form from an existing data source (e.g.
 * a SQL table or Umbraco member type), using the data source's default field
 * mappings so the caller only has to name the form.
 */

import {
  withStandardDecorators,
  createToolResult,
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
  PagedBasicFormModel,
} from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  dataSourceId: z
    .uuid()
    .describe("The id of an existing data source to generate the form from. Use list-data-sources to find valid ids."),
  formName: z.string().min(1).describe("Name for the new form that will be generated."),
};

const outputSchema = z.object({
  success: z.boolean(),
  id: z.string().describe("The id of the newly created form."),
});

const CreateFormFromDataSourceTool = {
  name: "create-form-from-data-source",
  description:
    "Creates a new Umbraco Forms form whose fields are generated automatically from an " +
    "existing data source's structure (e.g. one field per SQL column). Uses the data " +
    "source's default field mappings from get-data-source-wizard-scaffold — inspect that " +
    "tool first if you need to know which fields will be included before generating the " +
    "form. Requires an existing data source id; it does not create a data source.",
  inputSchema,
  outputSchema,
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

    const response = (await client.postDatasourceWizardCreateForm(
      payload,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<ProblemDetails | void>;

    if (response.status < 200 || response.status >= 300) {
      throw new UmbracoApiError(
        (response.data as ProblemDetails) || {
          status: response.status,
          detail: response.statusText,
        },
      );
    }

    // The wizard's create-form endpoint responds 200 with an empty body and no
    // Location header (unlike postFormByIdCopy / postPrevalueSource), so the new
    // form's id can't be read off the response. Resolve it the same way the
    // integration test does: search by the name we just gave it.
    const location = response.headers?.Location || response.headers?.location;
    let id = location?.split("/").pop();

    if (!id) {
      const searchResponse = (await client.getFormSearch(
        { query: formName },
        CAPTURE_RAW_HTTP_RESPONSE,
      )) as HttpResponse<PagedBasicFormModel | ProblemDetails>;

      if (searchResponse.status < 200 || searchResponse.status >= 300) {
        throw new UmbracoApiError(searchResponse.data as ProblemDetails);
      }

      const match = (searchResponse.data as PagedBasicFormModel).items.find(
        (form) => form.name === formName,
      );
      id = match?.id;
    }

    if (!id) {
      throw new UmbracoApiError({
        status: response.status,
        detail: "Form was created but its id could not be resolved afterwards.",
      });
    }

    return createToolResult({ success: true, id });
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(CreateFormFromDataSourceTool);
