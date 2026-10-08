/**
 * Get Form Version Tool
 *
 * Gets one saved version of a form, including the full design and workflows it captured.
 */

import {
  withStandardDecorators,
  getApiClient,
  createToolResult,
  UmbracoApiError,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
  type HttpResponse,
  type ProblemDetails,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type {
  FormVersionResponseModel,
  getUmbracoFormsManagementAPI,
} from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  getFormVersionByVersionIdParams,
  getFormVersionByVersionIdResponse,
} from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import { withFormsFeature } from "../../shared/forms-version.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  versionId: getFormVersionByVersionIdParams.shape.versionId.describe(
    "ID of the version - a version ID from list-form-versions, not a form ID.",
  ),
};

// The API serialises the captured form and workflows to JSON strings; they are
// returned parsed. The definition is Forms' stored form model rather than
// get-form-by-id's FormDesign: the same pages/fieldSets/containers/fields, but the
// form's ID is its `key` (`id` is an internal number).
const outputSchema = getFormVersionByVersionIdResponse.extend({
  definition: z
    .unknown()
    .describe("The form as it was saved in this version. Its `key` is the form ID; pages/fieldSets/fields follow get-form-by-id."),
  workflows: z.unknown().describe("The form's workflows as they were saved in this version."),
});

function parseJson(value: string | null | undefined): unknown {
  if (value === null || value === undefined) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

const GetFormVersionTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "get-form-version",
  description:
    "Gets one saved version of a form: when and by whom it was saved, plus the form (definition - pages, fieldSets " +
    "and fields as in get-form-by-id, with the form ID under `key`) and its workflows exactly as they were then. Use it to see what a form looked like before a change, or to check a " +
    "version before rolling back to it with rollback-form-version. The response holds the whole form, so browse " +
    "with list-form-versions and fetch only the versions you need.",
  inputSchema,
  outputSchema,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async ({ versionId }) => {
    const client = getApiClient<ApiClient>();
    const response = (await client.getFormVersionByVersionId(
      versionId,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as unknown as HttpResponse<FormVersionResponseModel | ProblemDetails>;

    if (response.status < 200 || response.status >= 300) {
      throw new UmbracoApiError(
        (response.data as ProblemDetails) || { status: response.status, detail: response.statusText },
      );
    }

    const version = response.data as FormVersionResponseModel;
    return createToolResult({
      ...version,
      definition: parseJson(version.definition),
      workflows: parseJson(version.workflows),
    });
  },
};

export default withStandardDecorators(withFormsFeature("formVersions", GetFormVersionTool));
