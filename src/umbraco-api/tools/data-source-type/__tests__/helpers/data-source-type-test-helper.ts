import { getApiClient } from "@umbraco-cms/mcp-server-sdk";
import type {
  getUmbracoFormsManagementAPI,
  DataSourceTypeWithSettings,
} from "../../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

export class DataSourceTypeTestHelper {
  /**
   * Find all data source types
   */
  static async findAll(): Promise<DataSourceTypeWithSettings[]> {
    const client = getApiClient<ApiClient>();
    const response = await client.getDataSourceType();
    return response as any as DataSourceTypeWithSettings[];
  }

  /**
   * Find a data source type by name
   */
  static async findByName(
    name: string
  ): Promise<DataSourceTypeWithSettings | undefined> {
    const types = await this.findAll();
    return types.find((t) => t.name === name);
  }

  /**
   * Get the first available data source type (for use in tests)
   */
  static async getFirst(): Promise<DataSourceTypeWithSettings> {
    const types = await this.findAll();
    if (types.length === 0) {
      throw new Error("No data source types found in Umbraco instance");
    }
    return types[0];
  }

  /**
   * Normalize IDs for snapshot testing
   */
  static normalizeIds(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeIds(item));
    }

    if (data && typeof data === "object") {
      const normalized = { ...data };

      // Normalize UUID fields
      if (normalized.id) {
        normalized.id = "00000000-0000-0000-0000-000000000000";
      }
      if (normalized.unique) {
        normalized.unique = "00000000-0000-0000-0000-000000000000";
      }

      // Normalize nested objects
      for (const key of Object.keys(normalized)) {
        if (typeof normalized[key] === "object") {
          normalized[key] = this.normalizeIds(normalized[key]);
        }
      }

      return normalized;
    }

    return data;
  }
}
