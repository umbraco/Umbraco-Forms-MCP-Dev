/**
 * Prevalue Source Builder
 *
 * Fluent builder for creating/deleting prevalue sources against the real
 * Umbraco Forms Management API for integration tests.
 *
 * By default it builds a "dataSource" (Static Values / DataSource) sourced
 * prevalue source, since that provider type declares no settings at all
 * (see prevalue-source-type's `settings: []`) — it needs no external
 * infrastructure (no SQL connection, no uploaded text file, no Umbraco
 * documents) to create successfully. The provider type is looked up by
 * alias at create() time via getPrevalueSourceType() rather than hardcoding
 * its id/unique, since those are instance-specific.
 */

import { getApiClient, CAPTURE_RAW_HTTP_RESPONSE, type HttpResponse } from "@umbraco-cms/mcp-server-sdk";
import type {
  getUmbracoFormsManagementAPI,
  FieldPreValueSource,
  FieldPreValueSourceSettings,
} from "../../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

export const TEST_PREVALUE_SOURCE_NAME = "_Test Prevalue Source";

/** Alias of the built-in provider type with no required settings. */
const DEFAULT_PROVIDER_ALIAS = "dataSource";

interface PrevalueSourceModel {
  name: string;
  fieldPreValueSourceTypeAlias: string;
  settings?: FieldPreValueSourceSettings;
  cachePrevaluesFor?: string;
}

export class PrevalueSourceBuilder {
  private model: PrevalueSourceModel = {
    name: TEST_PREVALUE_SOURCE_NAME,
    fieldPreValueSourceTypeAlias: DEFAULT_PROVIDER_ALIAS,
  };

  private createdId?: string;
  private createdTypeId?: string;

  withName(name: string): this {
    this.model.name = name;
    return this;
  }

  /** Selects the provider type by alias (e.g. "dataSource", "getValuesFromTextFile"). */
  withProviderTypeAlias(alias: string): this {
    this.model.fieldPreValueSourceTypeAlias = alias;
    return this;
  }

  withSettings(settings: FieldPreValueSourceSettings): this {
    this.model.settings = settings;
    return this;
  }

  withCachePrevaluesFor(cachePrevaluesFor: string): this {
    this.model.cachePrevaluesFor = cachePrevaluesFor;
    return this;
  }

  build(): PrevalueSourceModel {
    return { ...this.model };
  }

  async create(): Promise<this> {
    const client = getApiClient<ApiClient>();

    // Resolve the provider type id from its alias — never hardcode instance ids.
    const typesResponse = (await client.getPrevalueSourceType(
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<Array<{ id: string; alias: string }>>;

    if (typesResponse.status < 200 || typesResponse.status >= 300) {
      throw new Error(
        `Failed to list prevalue source types: HTTP ${typesResponse.status} ${typesResponse.statusText}`,
      );
    }

    const providerType = typesResponse.data?.find(
      (t) => t.alias === this.model.fieldPreValueSourceTypeAlias,
    );

    if (!providerType) {
      throw new Error(
        `No prevalue source type found with alias "${this.model.fieldPreValueSourceTypeAlias}"`,
      );
    }

    this.createdTypeId = providerType.id;

    // Fetch a fresh scaffold for server-generated defaults (id, audit fields, cache duration).
    const scaffoldResponse = (await client.getPrevalueSourceScaffold(
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<FieldPreValueSource>;

    if (scaffoldResponse.status < 200 || scaffoldResponse.status >= 300) {
      throw new Error(
        `Failed to get prevalue source scaffold: HTTP ${scaffoldResponse.status} ${scaffoldResponse.statusText}`,
      );
    }

    const scaffold = scaffoldResponse.data;

    const payload: FieldPreValueSource = {
      ...scaffold,
      name: this.model.name,
      fieldPreValueSourceTypeId: providerType.id,
      settings: this.model.settings ?? scaffold.settings,
      cachePrevaluesFor: this.model.cachePrevaluesFor ?? scaffold.cachePrevaluesFor,
    };

    const response = (await client.postPrevalueSource(
      payload,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse;

    if (response.status < 200 || response.status >= 300) {
      const errorBody = response.data ? JSON.stringify(response.data) : `HTTP ${response.status}`;
      throw new Error(`Failed to create prevalue source: ${errorBody}`);
    }

    const location = response.headers?.Location || response.headers?.location;
    this.createdId = location?.split("/").pop() ?? payload.id;

    return this;
  }

  async delete(): Promise<void> {
    if (!this.createdId) return;
    const client = getApiClient<ApiClient>();
    try {
      await client.deletePrevalueSourceById(this.createdId, CAPTURE_RAW_HTTP_RESPONSE);
    } catch {
      // Ignore delete failures in cleanup
    }
    this.createdId = undefined;
  }

  getId(): string {
    if (!this.createdId) {
      throw new Error("Prevalue source not created yet. Call create() first.");
    }
    return this.createdId;
  }

  getProviderTypeId(): string {
    if (!this.createdTypeId) {
      throw new Error("Prevalue source not created yet. Call create() first.");
    }
    return this.createdTypeId;
  }
}
