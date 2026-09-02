import {
  getApiClient,
  CAPTURE_RAW_HTTP_RESPONSE,
  type HttpResponse,
  type ProblemDetails,
} from "@umbraco-cms/mcp-server-sdk";
import type {
  getUmbracoFormsManagementAPI,
  FormDataSource,
} from "../../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

export class DataSourceTestHelper {
  /**
   * Find a data source by name.
   */
  static async findByName(name: string): Promise<FormDataSource | undefined> {
    const client = getApiClient<ApiClient>();
    const response = (await client.getDataSource(
      { skip: 0, take: 2147483647 },
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<{ total: number; items: FormDataSource[] } | ProblemDetails>;

    if (response.status < 200 || response.status >= 300) {
      return undefined;
    }

    const data = response.data as { total: number; items: FormDataSource[] };
    return data.items.find((item) => item.name === name);
  }

  /**
   * Clean up test data sources by name prefix.
   */
  static async cleanup(namePrefix: string): Promise<void> {
    const client = getApiClient<ApiClient>();
    const response = (await client.getDataSource(
      { skip: 0, take: 2147483647 },
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<{ total: number; items: FormDataSource[] } | ProblemDetails>;

    if (response.status < 200 || response.status >= 300) {
      return;
    }

    const data = response.data as { total: number; items: FormDataSource[] };
    const toDelete = data.items.filter((item) => item.name.startsWith(namePrefix));

    for (const item of toDelete) {
      try {
        await client.deleteDataSourceById(item.id, CAPTURE_RAW_HTTP_RESPONSE);
      } catch {
        // Ignore errors during cleanup
      }
    }
  }

  /**
   * Normalize IDs for snapshot testing.
   */
  static normalizeIds(data: unknown): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeIds(item));
    }

    if (data && typeof data === "object") {
      const normalized: Record<string, unknown> = { ...(data as Record<string, unknown>) };
      if (typeof normalized.id === "string") {
        normalized.id = "00000000-0000-0000-0000-000000000000";
      }
      if (typeof normalized.unique === "string") {
        normalized.unique = "00000000-0000-0000-0000-000000000000";
      }
      // The SDK's built-in date normalization only recognizes "updateDate", not Umbraco
      // Forms' "updated" — normalize it ourselves so a fresh timestamp per test run
      // doesn't flake the snapshot.
      if (typeof normalized.updated === "string") {
        normalized.updated = "NORMALIZED_DATE";
      }
      for (const key of Object.keys(normalized)) {
        if (typeof normalized[key] === "object") {
          normalized[key] = this.normalizeIds(normalized[key]);
        }
      }
      return normalized;
    }

    return data;
  }

  /**
   * Redact `settings` map values before snapshotting. Data source settings can carry
   * live secrets (e.g. a SQL connection string with a password) — this keeps those
   * values out of committed `.snap` files while still asserting the shape/keys.
   */
  static redactSettings(data: unknown): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this.redactSettings(item));
    }

    if (data && typeof data === "object") {
      const redacted: Record<string, unknown> = { ...(data as Record<string, unknown>) };

      if (redacted.settings && typeof redacted.settings === "object") {
        const settings = redacted.settings as Record<string, unknown>;
        redacted.settings = Object.fromEntries(Object.keys(settings).map((key) => [key, "**redacted**"]));
      }

      for (const key of Object.keys(redacted)) {
        if (typeof redacted[key] === "object") {
          redacted[key] = this.redactSettings(redacted[key]);
        }
      }
      return redacted;
    }

    return data;
  }
}
