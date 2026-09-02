/**
 * Create Data Source Tool
 *
 * Creates a new Umbraco Forms data source of a given type, with a name and
 * optional settings. Fetches the server's scaffold first so unfamiliar/audit
 * fields (timestamps, entity type) are filled in exactly as Umbraco expects,
 * then generates the new id itself — never ask the caller for a UUID.
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
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type {
  getUmbracoFormsManagementAPI,
  FormDataSource,
} from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  name: z.string().min(1).describe("Name for the new data source."),
  formDataSourceTypeId: z
    .uuid()
    .describe("Id of the data source type this data source is an instance of (e.g. SQL, Umbraco Members, XML)."),
  settings: z
    .record(z.string(), z.string())
    .optional()
    .describe(
      "Settings map for the data source, specific to its type (e.g. connection string, query). " +
        "Omit to create with empty/default settings.",
    ),
};

const outputSchema = z.object({
  success: z.boolean(),
  id: z.string().describe("The generated id of the new data source."),
  name: z.string(),
  formDataSourceTypeId: z.string(),
});

const CreateDataSourceTool = {
  name: "create-data-source",
  description:
    "Creates a new Umbraco Forms data source connecting a data source type (e.g. SQL, " +
    "Umbraco Members, XML) to a name and settings. Use list-data-sources or a data source " +
    "type lookup to find a valid formDataSourceTypeId first — this tool does not create " +
    "new types. The new data source's id is generated automatically; do not invent one.",
  inputSchema,
  outputSchema,
  slices: ["create"],
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
  },
  handler: async ({ name, formDataSourceTypeId, settings }) => {
    const client = getApiClient<ApiClient>();

    const scaffoldResponse = (await client.getDataSourceScaffold(
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<FormDataSource | ProblemDetails>;

    if (scaffoldResponse.status < 200 || scaffoldResponse.status >= 300) {
      throw new UmbracoApiError(scaffoldResponse.data as ProblemDetails);
    }

    const scaffold = scaffoldResponse.data as FormDataSource;
    const newId = randomUUID();

    const payload: FormDataSource = {
      ...scaffold,
      id: newId,
      unique: newId,
      name,
      formDataSourceTypeId,
      settings: settings ?? scaffold.settings,
    };

    const response = (await client.postDataSource(
      payload,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<ProblemDetails | void>;

    if (response.status < 200 || response.status >= 300) {
      throw new UmbracoApiError(response.data as ProblemDetails);
    }

    return createToolResult({
      success: true,
      id: newId,
      name,
      formDataSourceTypeId,
    });
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(CreateDataSourceTool);
