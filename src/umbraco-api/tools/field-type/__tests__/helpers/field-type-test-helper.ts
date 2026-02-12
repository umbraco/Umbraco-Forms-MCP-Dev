import { getApiClient } from "@umbraco-cms/mcp-server-sdk";
import type {
  getUmbracoFormsManagementAPI,
  FieldTypeWithSettings,
} from "../../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

export class FieldTypeTestHelper {
  /**
   * Find all field types
   */
  static async findAll(): Promise<FieldTypeWithSettings[]> {
    const client = getApiClient<ApiClient>();
    const response = await client.getFieldType();
    return response as any as FieldTypeWithSettings[];
  }

  /**
   * Find a field type by name
   */
  static async findByName(
    name: string
  ): Promise<FieldTypeWithSettings | undefined> {
    const types = await this.findAll();
    return types.find((t) => t.name === name);
  }

  /**
   * Get the first available field type (for use in tests)
   */
  static async getFirst(): Promise<FieldTypeWithSettings> {
    const types = await this.findAll();
    if (types.length === 0) {
      throw new Error("No field types found in Umbraco instance");
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
