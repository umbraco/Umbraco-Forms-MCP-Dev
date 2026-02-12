import { v4 as uuid } from "uuid";
import {
  getApiClient,
  CAPTURE_RAW_HTTP_RESPONSE,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const TEST_PREVALUE_SOURCE_NAME = "_Test Prevalue Source";

interface PrevalueSourceModel {
  id: string;
  unique: string;
  entityType: string;
  name: string;
  created: string;
  createdBy?: number | null;
  createdByName?: string | null;
  updated: string;
  updatedBy?: number | null;
  updatedByName?: string | null;
  settings: { [key: string]: string };
  fieldPreValueSourceTypeId: string;
  cachePrevaluesFor: string;
}

export class PrevalueSourceBuilder {
  private model: PrevalueSourceModel;
  private createdId?: string;

  constructor() {
    const now = new Date().toISOString();
    this.model = {
      id: uuid(),
      unique: uuid(),
      entityType: "FieldPreValueSource",
      name: TEST_PREVALUE_SOURCE_NAME,
      created: now,
      createdBy: null,
      createdByName: null,
      updated: now,
      updatedBy: null,
      updatedByName: null,
      settings: {},
      fieldPreValueSourceTypeId: "12345678-0000-0000-0000-000000000001",
      cachePrevaluesFor: "0",
    };
  }

  withName(name: string): this {
    this.model.name = name;
    return this;
  }

  withFieldPreValueSourceTypeId(id: string): this {
    this.model.fieldPreValueSourceTypeId = id;
    return this;
  }

  withSettings(settings: { [key: string]: string }): this {
    this.model.settings = settings;
    return this;
  }

  withCachePrevaluesFor(duration: string): this {
    this.model.cachePrevaluesFor = duration;
    return this;
  }

  build(): PrevalueSourceModel {
    return { ...this.model };
  }

  async create(): Promise<this> {
    const client = getApiClient<ApiClient>();
    const response = await client.postPrevalueSource(
      this.model as any,
      CAPTURE_RAW_HTTP_RESPONSE
    );
    const locationHeader =
      (response as any)?.headers?.location ||
      (response as any)?.headers?.Location;
    this.createdId = locationHeader
      ? locationHeader.split("/").pop()
      : this.model.id;
    return this;
  }

  getId(): string {
    if (!this.createdId) {
      throw new Error(
        "Prevalue source not created yet. Call create() first."
      );
    }
    return this.createdId;
  }

  getItem(): PrevalueSourceModel {
    return this.build();
  }
}
