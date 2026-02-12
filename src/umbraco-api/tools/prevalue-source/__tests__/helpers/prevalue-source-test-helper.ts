import { getApiClient } from "@umbraco-cms/mcp-server-sdk";
import type {
  getUmbracoFormsManagementAPI,
  FieldPreValueSource,
} from "../../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

export class PrevalueSourceTestHelper {
  /**
   * Find a prevalue source by name
   */
  static async findByName(name: string): Promise<FieldPreValueSource | undefined> {
    const client = getApiClient<ApiClient>();
    const response = await client.getPrevalueSource({ take: 100 });
    const pagedResult = response as any;
    if (!pagedResult.items) return undefined;
    return pagedResult.items.find((item: FieldPreValueSource) => item.name === name);
  }

  /**
   * Find a prevalue source by ID
   */
  static async findById(id: string): Promise<FieldPreValueSource | undefined> {
    const client = getApiClient<ApiClient>();
    try {
      const response = await client.getPrevalueSourceById(id);
      return response as any;
    } catch {
      return undefined;
    }
  }

  /**
   * Delete a prevalue source by ID
   */
  static async deleteById(id: string): Promise<void> {
    const client = getApiClient<ApiClient>();
    try {
      await client.deletePrevalueSourceById(id);
    } catch {
      // Ignore errors during cleanup
    }
  }

  /**
   * Clean up test prevalue sources by name prefix
   */
  static async cleanup(namePrefix: string): Promise<void> {
    const client = getApiClient<ApiClient>();
    const response = await client.getPrevalueSource({ take: 100 });
    const pagedResult = response as any;
    if (!pagedResult.items) return;
    const toDelete = pagedResult.items.filter((item: FieldPreValueSource) =>
      item.name.startsWith(namePrefix)
    );
    for (const item of toDelete) {
      try {
        await client.deletePrevalueSourceById(item.id);
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
      if (normalized.id) normalized.id = "00000000-0000-0000-0000-000000000000";
      if (normalized.unique) normalized.unique = "00000000-0000-0000-0000-000000000000";
      if (normalized.fieldPreValueSourceTypeId) normalized.fieldPreValueSourceTypeId = "00000000-0000-0000-0000-000000000000";
      if (normalized.created) normalized.created = "NORMALIZED_DATE";
      if (normalized.updated) normalized.updated = "NORMALIZED_DATE";
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
