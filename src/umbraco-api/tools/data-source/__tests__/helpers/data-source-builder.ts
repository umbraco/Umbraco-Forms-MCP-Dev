import { v4 as uuid } from "uuid";
import {
  getApiClient,
  CAPTURE_RAW_HTTP_RESPONSE,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const TEST_DATA_SOURCE_NAME = "_Test Data Source";
const TEST_DATA_SOURCE_TYPE_ID = "12345678-0000-0000-0000-000000000001";

interface DataSourceModel {
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
  formDataSourceTypeId: string;
  valid: boolean;
}

export class DataSourceBuilder {
  private model: DataSourceModel;
  private createdId?: string;

  constructor() {
    const now = new Date().toISOString();
    this.model = {
      id: uuid(),
      unique: uuid(),
      entityType: "FormDataSource",
      name: TEST_DATA_SOURCE_NAME,
      created: now,
      createdBy: null,
      createdByName: null,
      updated: now,
      updatedBy: null,
      updatedByName: null,
      settings: {},
      formDataSourceTypeId: TEST_DATA_SOURCE_TYPE_ID,
      valid: true,
    };
  }

  withName(name: string): this {
    this.model.name = name;
    return this;
  }

  withFormDataSourceTypeId(formDataSourceTypeId: string): this {
    this.model.formDataSourceTypeId = formDataSourceTypeId;
    return this;
  }

  withSettings(settings: { [key: string]: string }): this {
    this.model.settings = settings;
    return this;
  }

  build(): DataSourceModel {
    return { ...this.model };
  }

  async create(): Promise<this> {
    const client = getApiClient<ApiClient>();

    // Call API to create data source
    const response = await client.postDataSource(
      this.model as any,
      CAPTURE_RAW_HTTP_RESPONSE
    );

    // Extract ID from Location header
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
        "Data source not created yet. Call create() first."
      );
    }
    return this.createdId;
  }

  getItem(): DataSourceModel {
    return this.build();
  }
}
