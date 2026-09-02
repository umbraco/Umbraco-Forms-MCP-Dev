/**
 * Update Data Source Tool
 *
 * Updates the name, data source type, or settings of an existing Umbraco Forms
 * data source. Reads the current record first and only overwrites the fields
 * that are supplied, leaving everything else (audit fields, validity) untouched.
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
  FormDataSource,
} from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: z.uuid().describe("The id of the data source to update. Use list-data-sources to find valid ids."),
  name: z.string().min(1).optional().describe("New name for the data source. Omit to leave unchanged."),
  formDataSourceTypeId: z
    .uuid()
    .optional()
    .describe("Id of a different data source type to switch this data source to. Omit to leave unchanged."),
  settings: z
    .record(z.string(), z.string())
    .optional()
    .describe(
      "Replacement settings map for the data source (keys/values depend on the data source " +
        "type, e.g. connection strings or query text). Omit to leave settings unchanged. When " +
        "provided, this fully replaces the existing settings map.",
    ),
};

const UpdateDataSourceTool = {
  name: "update-data-source",
  description:
    "Updates an existing Umbraco Forms data source's name, data source type, and/or " +
    "settings. Only the fields you supply are changed; anything omitted keeps its " +
    "current value. Use get-data-source first if unsure what the current settings are, " +
    "since a supplied settings map fully replaces the existing one rather than merging.",
  inputSchema,
  slices: ["update"],
  annotations: {
    idempotentHint: true,
  },
  handler: async ({ id, name, formDataSourceTypeId, settings }) => {
    const client = getApiClient<ApiClient>();

    const existingResponse = (await client.getDataSourceById(
      id,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<FormDataSource | ProblemDetails>;

    if (existingResponse.status < 200 || existingResponse.status >= 300) {
      throw new UmbracoApiError(existingResponse.data as ProblemDetails);
    }

    const existing = existingResponse.data as FormDataSource;

    const payload: FormDataSource = {
      ...existing,
      name: name ?? existing.name,
      formDataSourceTypeId: formDataSourceTypeId ?? existing.formDataSourceTypeId,
      settings: settings ?? existing.settings,
    };

    return executeVoidApiCall<ApiClient>((client) =>
      client.putDataSourceById(id, payload, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(UpdateDataSourceTool);
