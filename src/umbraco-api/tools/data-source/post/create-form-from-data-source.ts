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

// getFormSearch matches on a name *substring* and defaults to `take: 10`
// server-side when no `take` is given. This value is a generously large
// explicit page size so a realistic number of same-named forms are covered
// in one page — it doesn't need to survive pathological cases (hundreds of
// identically-named forms), only realistic ones.
const FORM_SEARCH_TAKE = 100;

/** Ids of forms whose name matches `formName` exactly (search is substring-only). */
async function findExactNameFormIds(client: ApiClient, formName: string): Promise<Set<string>> {
  const searchResponse = (await client.getFormSearch(
    { query: formName, take: FORM_SEARCH_TAKE },
    CAPTURE_RAW_HTTP_RESPONSE,
  )) as HttpResponse<PagedBasicFormModel | ProblemDetails>;

  if (searchResponse.status < 200 || searchResponse.status >= 300) {
    throw new UmbracoApiError(searchResponse.data as ProblemDetails);
  }

  const ids = (searchResponse.data as PagedBasicFormModel).items
    .filter((form) => form.name === formName)
    .map((form) => form.id);

  return new Set(ids);
}

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

    // Umbraco Forms does not enforce unique form names, so a form named
    // `formName` may already exist before we create ours. Record those ids
    // now so that, after creating, we can identify the new form as the one
    // that *wasn't* in this set rather than guessing at a name match.
    const idsBeforeCreate = await findExactNameFormIds(client, formName);

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

    // Fast path: use a Location header if one is ever present. Confirmed
    // against a live instance that the wizard's create-form endpoint responds
    // 2xx with an empty body and no Location header (unlike postFormByIdCopy
    // / postPrevalueSource), so this is expected to be unused in practice —
    // kept only in case that differs on some Umbraco Forms version.
    const location = response.headers?.Location || response.headers?.location;
    let id = location?.split("/").pop();

    if (!id) {
      // No Location header: resolve the new form's id by diffing the set of
      // exact-name matches before and after creation. This is deliberately
      // NOT the same lookup the integration test's cleanup helper
      // (`findFormIdByName`) uses — that helper reads the unpaged
      // `getForm()` list and takes the first name match, which is exactly
      // the "first match wins" bug this diff avoids.
      const idsAfterCreate = await findExactNameFormIds(client, formName);
      const newIds = [...idsAfterCreate].filter((candidateId) => !idsBeforeCreate.has(candidateId));

      if (newIds.length === 1) {
        id = newIds[0];
      } else if (newIds.length === 0) {
        throw new UmbracoApiError({
          status: response.status,
          detail:
            `Form "${formName}" was created but no new form with that exact name could be ` +
            "found afterwards (the search may have missed it, e.g. due to paging).",
        });
      } else {
        throw new UmbracoApiError({
          status: response.status,
          detail:
            `Form "${formName}" was created but ${newIds.length} new forms with that exact ` +
            "name were found afterwards, so the created form's id is ambiguous " +
            `(ids: ${newIds.join(", ")}).`,
        });
      }
    }

    return createToolResult({ success: true, id });
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(CreateFormFromDataSourceTool);
