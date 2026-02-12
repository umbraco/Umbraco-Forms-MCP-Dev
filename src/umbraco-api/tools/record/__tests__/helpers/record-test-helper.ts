import { getApiClient } from "@umbraco-cms/mcp-server-sdk";
import type {
  getUmbracoFormsManagementAPI,
  BasicForm,
  EntrySearchResultCollection,
  EntrySearchResult,
} from "../../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

export class RecordTestHelper {
  /**
   * Find records for a specific form
   */
  static async findByFormId(formId: string): Promise<EntrySearchResult[]> {
    const client = getApiClient<ApiClient>();
    const response = await client.getFormByFormIdRecord(formId, { take: 100 });
    const collection = response as any as EntrySearchResultCollection;
    return collection.results || [];
  }

  /**
   * Find a record by its uniqueId
   */
  static async findByUniqueId(
    formId: string,
    uniqueId: string
  ): Promise<EntrySearchResult | undefined> {
    const records = await this.findByFormId(formId);
    return records.find((r) => r.uniqueId === uniqueId);
  }

  /**
   * Find all forms (helper method for cleanup)
   */
  private static async findAllForms(): Promise<BasicForm[]> {
    const client = getApiClient<ApiClient>();
    const response = await client.getForm();
    return response as any as BasicForm[];
  }

  /**
   * Clean up test forms (and their records) by name prefix
   * Records are automatically deleted when their parent form is deleted
   */
  static async cleanup(formNamePrefix: string): Promise<void> {
    const forms = await this.findAllForms();
    const client = getApiClient<ApiClient>();

    const toDelete = forms.filter((f) => f.name.startsWith(formNamePrefix));

    for (const form of toDelete) {
      try {
        await client.deleteFormById(form.id);
      } catch {
        // Ignore errors during cleanup
      }
    }
  }

  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  private static readonly ISO_DATE_REGEX =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
  private static readonly ZERO_UUID = "00000000-0000-0000-0000-000000000000";

  /**
   * Normalize IDs and dates for snapshot testing.
   * Handles UUIDs, ISO dates, and auto-incrementing numeric IDs
   * in all positions including deeply nested structures and
   * record field value arrays.
   */
  static normalizeIds(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeIds(item));
    }

    // Normalize standalone UUID strings
    if (typeof data === "string" && this.UUID_REGEX.test(data)) {
      return this.ZERO_UUID;
    }

    // Normalize standalone ISO date strings
    if (typeof data === "string" && this.ISO_DATE_REGEX.test(data)) {
      return "NORMALIZED_DATE";
    }

    if (data && typeof data === "object") {
      const normalized = { ...data };

      // Normalize known UUID fields
      for (const field of ["id", "uniqueId", "form", "formId", "fieldId"]) {
        if (typeof normalized[field] === "string" && this.UUID_REGEX.test(normalized[field])) {
          normalized[field] = this.ZERO_UUID;
        }
      }

      // Normalize auto-incrementing numeric ID
      if (typeof normalized.id === "number") {
        normalized.id = 0;
      }

      // Normalize score
      if (typeof normalized.score === "number") {
        normalized.score = 0;
      }

      // Normalize date fields
      for (const field of ["created", "updated"]) {
        if (typeof normalized[field] === "string" && this.ISO_DATE_REGEX.test(normalized[field])) {
          normalized[field] = "NORMALIZED_DATE";
        }
      }

      // Normalize record field values (handles { fieldId: "created", value: "2026-..." } pattern)
      if (normalized.fieldId && normalized.value !== undefined) {
        if (typeof normalized.value === "string" && this.ISO_DATE_REGEX.test(normalized.value)) {
          normalized.value = "NORMALIZED_DATE";
        }
        if (typeof normalized.value === "number" && normalized.fieldId === "recordId") {
          normalized.value = 0;
        }
      }

      // Recursively normalize all nested objects and arrays
      for (const key of Object.keys(normalized)) {
        if (normalized[key] && typeof normalized[key] === "object") {
          normalized[key] = this.normalizeIds(normalized[key]);
        }
      }

      return normalized;
    }

    return data;
  }
}
