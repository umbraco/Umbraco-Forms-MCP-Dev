/**
 * Create Prevalue Source Tool
 *
 * Creates a new prevalue source — a reusable provider that resolves a
 * dropdown/list field's options at render or submit time (e.g. from a REST
 * endpoint, SQL query, or Umbraco members).
 *
 * Uses manual handling because the underlying API requires a fully-formed
 * entity (including a server-issued ID and audit timestamps) as the POST
 * body. Rather than asking the LLM to invent those values, this tool first
 * fetches a fresh scaffold from the server, then overlays the caller's
 * name/type/settings on top of it before posting.
 */

import {
  withStandardDecorators,
  createToolResult,
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
import { postPrevalueSourceBodyCachePrevaluesForRegExp } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  name: z.string().min(1).max(255).describe("Display name of the new prevalue source."),
  fieldPreValueSourceTypeId: z
    .uuid()
    .describe(
      "ID of the prevalue source type/provider (e.g. REST, SQL, Umbraco members) this source " +
        "uses. Look up available provider type IDs with the prevalue-source-type list tool.",
    ),
  settings: z
    .record(z.string(), z.string())
    .optional()
    .describe(
      "Provider-specific settings as key/value pairs (e.g. endpoint URL, connection string). " +
        "Omit for provider types that need no settings.",
    ),
  cachePrevaluesFor: z
    .string()
    .regex(postPrevalueSourceBodyCachePrevaluesForRegExp)
    .optional()
    .describe(
      "How long to cache resolved prevalues before refreshing, as a .NET TimeSpan string " +
        "'dd.hh:mm:ss' (e.g. '01:00:00' for one hour, '00:00:00' for no caching). Omit to use " +
        "the server default.",
    ),
};

const outputSchema = z.object({
  success: z.boolean(),
  id: z.string().optional(),
});

const createPrevalueSourceTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "create-prevalue-source",
  description:
    "Creates a new prevalue source that resolves a dropdown/list field's options from a " +
    "provider such as a REST endpoint, SQL query, or Umbraco members. Requires the target " +
    "provider type's ID (fieldPreValueSourceTypeId) — look this up first with the " +
    "prevalue-source-type list tool. Returns the new source's ID on success.",
  inputSchema,
  outputSchema,
  slices: ["create"],
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
  },
  handler: async ({ name, fieldPreValueSourceTypeId, settings, cachePrevaluesFor }) => {
    const client = getApiClient<ApiClient>();

    // Fetch a fresh scaffold to get server-generated defaults (id, unique,
    // audit fields, default cache duration) so the LLM never has to invent them.
    const scaffoldResponse = (await client.getPrevalueSourceScaffold(
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<FieldPreValueSource>;

    if (scaffoldResponse.status < 200 || scaffoldResponse.status >= 300) {
      throw new UmbracoApiError(
        (scaffoldResponse.data as unknown as Record<string, unknown>) || {
          status: scaffoldResponse.status,
          detail: scaffoldResponse.statusText,
        },
      );
    }

    const scaffold = scaffoldResponse.data;

    const payload: FieldPreValueSource = {
      ...scaffold,
      name,
      fieldPreValueSourceTypeId,
      settings: settings ?? scaffold.settings,
      cachePrevaluesFor: cachePrevaluesFor ?? scaffold.cachePrevaluesFor,
    };

    const response = (await client.postPrevalueSource(
      payload,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse;

    if (response.status < 200 || response.status >= 300) {
      const errorData = response.data as Record<string, unknown> | undefined;
      throw new UmbracoApiError(
        errorData || {
          status: response.status,
          detail: response.statusText,
        },
      );
    }

    const location = response.headers?.Location || response.headers?.location;
    const id = location?.split("/").pop() ?? payload.id;

    return createToolResult({ success: true, id });
  },
};

export default withStandardDecorators(createPrevalueSourceTool);
