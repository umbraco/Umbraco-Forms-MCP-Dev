import { getApiClient } from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../../api/generated/umbracoFormsManagementApi.js";
import type { FormDataSource } from "../../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

export class DataSourceTestHelper {
  /**
   * Find a data source by name
   */
  static async findByName(name: string): Promise<FormDataSource | undefined> {
    const client = getApiClient<ApiClient>();
    const response = await client.getDataSource({ take: 100 });

    // The response is directly the paged result, not wrapped in .data
    const pagedResult = response as any;

    if (!pagedResult.items) {
      return undefined;
    }

    return pagedResult.items.find((item: FormDataSource) => item.name === name);
  }

  /**
   * Clean up test data sources by name prefix
   */
  static async cleanup(namePrefix: string): Promise<void> {
    const client = getApiClient<ApiClient>();
    const response = await client.getDataSource({ take: 100 });

    // The response is directly the paged result, not wrapped in .data
    const pagedResult = response as any;

    if (!pagedResult.items) {
      return;
    }

    const toDelete = pagedResult.items.filter((item: FormDataSource) =>
      item.name.startsWith(namePrefix)
    );

    for (const item of toDelete) {
      try {
        await client.deleteDataSourceById(item.id);
      } catch {
        // Ignore errors during cleanup
      }
    }
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

      // Normalize common UUID fields
      if (normalized.id) {
        normalized.id = "00000000-0000-0000-0000-000000000000";
      }
      if (normalized.unique) {
        normalized.unique = "00000000-0000-0000-0000-000000000000";
      }
      if (normalized.formDataSourceTypeId) {
        normalized.formDataSourceTypeId = "00000000-0000-0000-0000-000000000000";
      }

      // Normalize date fields
      if (normalized.created) {
        normalized.created = "NORMALIZED_DATE";
      }
      if (normalized.updated) {
        normalized.updated = "NORMALIZED_DATE";
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
