/**
 * Form Test Helper
 *
 * Find, clean up, and normalize forms created as test data. Also provides a
 * small folder helper — the Forms folder namespace is shared across forms
 * and data sources (see `postFolder`/tree endpoints), so a real folder is
 * needed to test tree ancestors/children with actual ancestry.
 */

import { CAPTURE_RAW_HTTP_RESPONSE, type HttpResponse } from "@umbraco-cms/mcp-server-sdk";
import { randomUUID } from "node:crypto";
import { getUmbracoFormsManagementAPI } from "../../../../api/generated/umbracoFormsManagementApi.js";

interface BasicFormItem {
  id: string;
  name: string;
}

export class FormTestHelper {
  /**
   * Find a form by name via the unpaged list endpoint.
   */
  static async findByName(name: string): Promise<BasicFormItem | undefined> {
    const client = getUmbracoFormsManagementAPI();
    const response = (await client.getForm()) as unknown as BasicFormItem[];
    return response.find((item) => item.name === name);
  }

  /**
   * Deletes all forms whose name starts with `namePrefix`. Used as a safety
   * net in `afterEach` in case a test failed before its own builder cleanup
   * ran.
   */
  static async cleanup(namePrefix: string): Promise<void> {
    const client = getUmbracoFormsManagementAPI();
    const forms = (await client.getForm()) as unknown as BasicFormItem[];

    const toDelete = forms.filter((form) => form.name.startsWith(namePrefix));

    for (const form of toDelete) {
      try {
        await client.deleteFormById(form.id, CAPTURE_RAW_HTTP_RESPONSE);
      } catch {
        // Ignore delete failures during cleanup.
      }
    }
  }

  /**
   * Creates a real Forms folder (shared namespace with forms) for tree
   * ancestor/children tests that need actual parent/child ancestry. Returns
   * the folder's ID.
   */
  static async createFolder(name: string, parentId?: string): Promise<string> {
    const client = getUmbracoFormsManagementAPI();
    const id = randomUUID();

    const response = (await client.postFolder(
      { id, name, parentId: parentId ?? null },
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as unknown as HttpResponse;

    if (response.status < 200 || response.status >= 300) {
      throw new Error(
        `Failed to create test folder: HTTP ${response.status} ${JSON.stringify(response.data)}`,
      );
    }

    return id;
  }

  static async deleteFolder(id: string): Promise<void> {
    const client = getUmbracoFormsManagementAPI();
    try {
      await client.deleteFolderById(id, CAPTURE_RAW_HTTP_RESPONSE);
    } catch {
      // Ignore delete failures during cleanup.
    }
  }

  /**
   * Recursively normalizes IDs and volatile fields for snapshot testing.
   *
   * A full FormDesign (returned by get-form-by-id, get-form-scaffold, etc.)
   * carries dozens of client-generated GUIDs at every depth — form id,
   * unique, page ids, fieldset ids, field ids, workflow ids, and the
   * workflow's own "form" foreign key — plus a "path" string with an
   * embedded GUID and a numeric "nodeId" that increments per test run.
   * `createSnapshotResult`'s built-in normalization only touches the
   * top-level `id` and a fixed date-field allowlist, so this helper instead
   * does a blanket regex replace of any GUID-shaped substring (whole-value
   * or embedded, e.g. in "path") plus known volatile non-GUID fields.
   */
  static normalizeIds(data: any): any {
    const GUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
    const BLANK_UUID = "00000000-0000-0000-0000-000000000000";

    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeIds(item));
    }

    if (data && typeof data === "object") {
      const normalized: Record<string, any> = { ...data };

      for (const key of Object.keys(normalized)) {
        const value = normalized[key];

        if (typeof value === "string" && GUID_REGEX.test(value)) {
          normalized[key] = value.replace(GUID_REGEX, BLANK_UUID);
        } else if (key === "nodeId" && typeof value === "number") {
          normalized[key] = 0;
        } else if ((key === "created" || key === "updated") && typeof value === "string") {
          normalized[key] = "2000-01-01T00:00:00.000Z";
        } else if (value && typeof value === "object") {
          normalized[key] = this.normalizeIds(value);
        }
      }

      return normalized;
    }

    return data;
  }
}
