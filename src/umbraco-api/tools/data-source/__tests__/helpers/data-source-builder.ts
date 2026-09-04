import { randomUUID } from "node:crypto";
import {
  getApiClient,
  CAPTURE_RAW_HTTP_RESPONSE,
  type HttpResponse,
  type ProblemDetails,
} from "@umbraco-cms/mcp-server-sdk";
import type {
  getUmbracoFormsManagementAPI,
  FormDataSource,
  FormDataSourceSettings,
} from "../../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

export const TEST_DATA_SOURCE_NAME = "_Test Data Source";

// The "SQL Database" data source type is the only built-in type on this instance.
// It validates connectivity live against the settings it's given, so — rather than
// fabricating fake external infra — these tests point it at the same real SQL Server
// that already backs this Umbraco instance, against a stock Umbraco system table with
// only basic column types. The connection string is environment-specific (differs
// between a local dev's appsettings.local.json and CI's SQL Server container), so it's
// overridable via TEST_SQL_DATA_SOURCE_CONNECTION rather than hardcoded to one machine.
export const SQL_DATA_SOURCE_TYPE_ID = "f19506f3-efea-4b13-a308-89348f69df91";

export const DEFAULT_DATA_SOURCE_SETTINGS: FormDataSourceSettings = {
  Connection:
    process.env.TEST_SQL_DATA_SOURCE_CONNECTION ??
    "Server=localhost,1433;Database=FormsMcpDb;User Id=sa;Password=MyStrong!Passw0rd;TrustServerCertificate=True;Encrypt=False",
  Table: "umbracoLock",
};

interface DataSourceModel {
  name: string;
  formDataSourceTypeId: string;
  settings: FormDataSourceSettings;
}

export class DataSourceBuilder {
  private model: DataSourceModel = {
    name: TEST_DATA_SOURCE_NAME,
    formDataSourceTypeId: SQL_DATA_SOURCE_TYPE_ID,
    settings: { ...DEFAULT_DATA_SOURCE_SETTINGS },
  };

  private createdId?: string;

  withName(name: string): this {
    this.model.name = name;
    return this;
  }

  withFormDataSourceTypeId(formDataSourceTypeId: string): this {
    this.model.formDataSourceTypeId = formDataSourceTypeId;
    return this;
  }

  withSettings(settings: FormDataSourceSettings): this {
    this.model.settings = settings;
    return this;
  }

  build(): DataSourceModel {
    return { ...this.model, settings: { ...this.model.settings } };
  }

  async create(): Promise<this> {
    const client = getApiClient<ApiClient>();

    const scaffoldResponse = (await client.getDataSourceScaffold(
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<FormDataSource | ProblemDetails>;

    if (scaffoldResponse.status < 200 || scaffoldResponse.status >= 300) {
      throw new Error(
        `Failed to fetch data source scaffold: HTTP ${scaffoldResponse.status} ${JSON.stringify(scaffoldResponse.data)}`,
      );
    }

    const scaffold = scaffoldResponse.data as FormDataSource;
    const newId = randomUUID();

    const payload: FormDataSource = {
      ...scaffold,
      id: newId,
      unique: newId,
      name: this.model.name,
      formDataSourceTypeId: this.model.formDataSourceTypeId,
      settings: this.model.settings,
    };

    const response = (await client.postDataSource(
      payload,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<ProblemDetails | void>;

    if (response.status < 200 || response.status >= 300) {
      throw new Error(
        `Failed to create data source: HTTP ${response.status} ${JSON.stringify(response.data)}`,
      );
    }

    this.createdId = newId;

    return this;
  }

  async delete(): Promise<void> {
    if (!this.createdId) return;
    const client = getApiClient<ApiClient>();
    try {
      await client.deleteDataSourceById(this.createdId, CAPTURE_RAW_HTTP_RESPONSE);
    } catch {
      // Ignore delete failures in cleanup
    }
    this.createdId = undefined;
  }

  getId(): string {
    if (!this.createdId) {
      throw new Error("Data source not created yet. Call create() first.");
    }
    return this.createdId;
  }
}
