import { getApiClient } from "@umbraco-cms/mcp-server-sdk";
import type {
  getUmbracoFormsManagementAPI,
  BasicForm,
} from "../../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

export class FormTestHelper {
  /**
   * Find all forms
   */
  static async findAll(): Promise<BasicForm[]> {
    const client = getApiClient<ApiClient>();
    const response = await client.getForm();
    return response as any as BasicForm[];
  }

  /**
   * Find a form by name
   */
  static async findByName(name: string): Promise<BasicForm | undefined> {
    const forms = await this.findAll();
    return forms.find((f) => f.name === name);
  }

  /**
   * Clean up test forms by name prefix
   */
  static async cleanup(namePrefix: string): Promise<void> {
    const forms = await this.findAll();
    const client = getApiClient<ApiClient>();

    const toDelete = forms.filter((f) => f.name.startsWith(namePrefix));

    for (const form of toDelete) {
      try {
        await client.deleteFormById(form.id);
      } catch {
        // Ignore errors during cleanup
      }
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

      const UUID_REGEX =
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
      const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

      // Normalize UUID fields
      if (normalized.id) {
        normalized.id = ZERO_UUID;
      }
      if (normalized.unique) {
        normalized.unique = ZERO_UUID;
      }
      if (normalized.parentUnique) {
        normalized.parentUnique = ZERO_UUID;
      }
      if (normalized.form) {
        normalized.form = ZERO_UUID;
      }
      if (normalized.folderId) {
        normalized.folderId = ZERO_UUID;
      }

      // Normalize auto-incrementing nodeId
      if (typeof normalized.nodeId === "number") {
        normalized.nodeId = 0;
      }

      // Normalize path field (contains embedded UUIDs like "-1,uuid")
      if (typeof normalized.path === "string") {
        normalized.path = normalized.path.replace(UUID_REGEX, ZERO_UUID);
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
