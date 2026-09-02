/**
 * Update Prevalue Source Tool
 *
 * Updates an existing prevalue source's name, provider type, settings,
 * and/or cache duration. Uses manual handling because the underlying API
 * is a full-entity replace: it requires audit fields (created, updatedBy,
 * etc.) that the LLM should never invent. This tool fetches the current
 * entity first, overlays only the fields the caller provided, and puts the
 * merged result back — so omitted fields are left unchanged.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  getApiClient,
  UmbracoApiError,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
  type HttpResponse,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type {
  getUmbracoFormsManagementAPI,
  FieldPreValueSource,
} from "../../../api/generated/umbracoFormsManagementApi.js";
import { putPrevalueSourceByIdBodyCachePrevaluesForRegExp } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: z.uuid().describe("ID of the prevalue source to update."),
  name: z.string().min(1).max(255).optional().describe("New display name. Omit to keep the current name."),
  fieldPreValueSourceTypeId: z
    .uuid()
    .optional()
    .describe("ID of the provider type to switch to. Omit to keep the current provider type."),
  settings: z
    .record(z.string(), z.string())
    .optional()
    .describe(
      "Provider-specific settings as key/value pairs. Replaces the entire settings map when " +
        "provided. Omit to keep the current settings.",
    ),
  cachePrevaluesFor: z
    .string()
    .regex(putPrevalueSourceByIdBodyCachePrevaluesForRegExp)
    .optional()
    .describe(
      "How long to cache resolved prevalues, as a .NET TimeSpan string 'dd.hh:mm:ss'. Omit to " +
        "keep the current caching duration.",
    ),
};

const updatePrevalueSourceTool: ToolDefinition<typeof inputSchema, undefined> = {
  name: "update-prevalue-source",
  description:
    "Updates an existing prevalue source's name, provider type, settings, or cache duration. " +
    "Only the fields you provide are changed — omitted fields keep their current value. Use " +
    "get-prevalue-source first if you need to see the current values.",
  inputSchema,
  slices: ["update"],
  annotations: {
    idempotentHint: true,
  },
  handler: async ({ id, name, fieldPreValueSourceTypeId, settings, cachePrevaluesFor }) => {
    const client = getApiClient<ApiClient>();

    const currentResponse = (await client.getPrevalueSourceById(
      id,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<FieldPreValueSource>;

    if (currentResponse.status < 200 || currentResponse.status >= 300) {
      throw new UmbracoApiError(
        (currentResponse.data as unknown as Record<string, unknown>) || {
          status: currentResponse.status,
          detail: currentResponse.statusText,
        },
      );
    }

    const current = currentResponse.data;

    const payload: FieldPreValueSource = {
      ...current,
      name: name ?? current.name,
      fieldPreValueSourceTypeId: fieldPreValueSourceTypeId ?? current.fieldPreValueSourceTypeId,
      settings: settings ?? current.settings,
      cachePrevaluesFor: cachePrevaluesFor ?? current.cachePrevaluesFor,
    };

    return executeVoidApiCall<ApiClient>((c) =>
      c.putPrevalueSourceById(id, payload, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(updatePrevalueSourceTool);
