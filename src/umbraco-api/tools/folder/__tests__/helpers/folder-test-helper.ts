import { getApiClient } from "@umbraco-cms/mcp-server-sdk";
import type {
  getUmbracoFormsManagementAPI,
  Folder,
} from "../../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

export class FolderTestHelper {
  /**
   * Get a folder by ID (returns undefined if not found)
   */
  static async findById(id: string): Promise<Folder | undefined> {
    const client = getApiClient<ApiClient>();
    try {
      const folder = await client.getFolderById(id);
      return folder as any as Folder;
    } catch {
      return undefined;
    }
  }

  /**
   * Delete a folder by ID, ignoring errors
   */
  static async deleteById(id: string): Promise<void> {
    const client = getApiClient<ApiClient>();
    try {
      await client.deleteFolderById(id);
    } catch {
      // Ignore errors during cleanup
    }
  }

  /**
   * Normalize IDs and dates for snapshot testing
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
      if (normalized.parentId) {
        normalized.parentId = "00000000-0000-0000-0000-000000000000";
      }

      // Normalize date fields
      if (normalized.created) {
        normalized.created = "NORMALIZED_DATE";
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
