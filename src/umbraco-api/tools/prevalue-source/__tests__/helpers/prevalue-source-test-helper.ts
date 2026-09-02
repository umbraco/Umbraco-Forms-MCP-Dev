/**
 * Prevalue Source Test Helper
 *
 * Find/cleanup/normalize helpers for prevalue source integration tests,
 * built on top of the real Umbraco Forms Management API.
 */

import { getApiClient, CAPTURE_RAW_HTTP_RESPONSE, type HttpResponse } from "@umbraco-cms/mcp-server-sdk";
import type {
  getUmbracoFormsManagementAPI,
  FieldPreValueSource,
  PagedFieldPreValueSourceModel,
} from "../../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

export class PrevalueSourceTestHelper {
  /**
   * Find a prevalue source by exact name.
   */
  static async findByName(name: string): Promise<FieldPreValueSource | undefined> {
    const client = getApiClient<ApiClient>();
    const response = (await client.getPrevalueSource(
      { skip: 0, take: 1000 },
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<PagedFieldPreValueSourceModel>;

    if (response.status < 200 || response.status >= 300) {
      return undefined;
    }

    return response.data?.items.find((item) => item.name === name);
  }

  /**
   * Delete every prevalue source whose name starts with the given prefix.
   */
  static async cleanup(namePrefix: string): Promise<void> {
    const client = getApiClient<ApiClient>();
    const response = (await client.getPrevalueSource(
      { skip: 0, take: 1000 },
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<PagedFieldPreValueSourceModel>;

    if (response.status < 200 || response.status >= 300) {
      return;
    }

    const toDelete = response.data?.items.filter((item) => item.name.startsWith(namePrefix)) ?? [];

    for (const item of toDelete) {
      try {
        await client.deletePrevalueSourceById(item.id, CAPTURE_RAW_HTTP_RESPONSE);
      } catch {
        // Ignore errors during cleanup
      }
    }
  }

  /**
   * Normalize IDs for snapshot testing — replaces any "id" field with the
   * blank UUID placeholder so snapshots stay stable across test runs.
   */
  static normalizeIds(data: unknown): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeIds(item));
    }

    if (data && typeof data === "object") {
      const normalized: Record<string, unknown> = { ...(data as Record<string, unknown>) };
      if (normalized.id) {
        normalized.id = "00000000-0000-0000-0000-000000000000";
      }
      for (const key of Object.keys(normalized)) {
        if (normalized[key] && typeof normalized[key] === "object") {
          normalized[key] = this.normalizeIds(normalized[key]);
        }
      }
      return normalized;
    }

    return data;
  }

  /**
   * Normalize volatile FieldPreValueSource fields for snapshot testing:
   * - "updated": an audit timestamp the SDK's createSnapshotResult helper
   *   doesn't normalize (its DATE_FIELDS list only covers "created" and a
   *   few others), so it would change on every real run.
   * - "unique": a second server-generated GUID (distinct from "id") assigned
   *   fresh to every created entity, which createSnapshotResult also has no
   *   knowledge of since it only replaces the top-level "id" field.
   */
  static normalizeVolatileFields(data: unknown): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeVolatileFields(item));
    }

    if (data && typeof data === "object") {
      const normalized: Record<string, unknown> = { ...(data as Record<string, unknown>) };
      if (normalized.updated) {
        normalized.updated = "NORMALIZED_DATE";
      }
      if (normalized.unique) {
        normalized.unique = "00000000-0000-0000-0000-000000000000";
      }
      for (const key of Object.keys(normalized)) {
        if (normalized[key] && typeof normalized[key] === "object") {
          normalized[key] = this.normalizeVolatileFields(normalized[key]);
        }
      }
      return normalized;
    }

    return data;
  }
}
