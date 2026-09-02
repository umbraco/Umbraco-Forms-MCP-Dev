/**
 * Folder Test Helper
 *
 * The folder collection has no list/search endpoint of its own — folders are
 * browsed via the form tree ("/tree/form/root" and "/tree/form/children/{id}")
 * with `foldersOnly: true`. This helper uses that tree to find and clean up
 * folders created by tests.
 */

import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../../api/generated/umbracoFormsManagementApi.js";

interface FolderTreeItem {
  id: string;
  name: string;
  isFolder: boolean;
  hasChildren: boolean;
  parent?: { id: string } | null;
}

export class FolderTestHelper {
  /**
   * Find a folder by name. Searches the root by default, or the children of
   * `parentId` when supplied.
   */
  static async findByName(
    name: string,
    parentId?: string,
  ): Promise<FolderTreeItem | undefined> {
    const client = getUmbracoFormsManagementAPI();

    const response = (parentId
      ? await client.getTreeFormChildrenByParentId(parentId, { foldersOnly: true })
      : await client.getTreeFormRoot({ foldersOnly: true })) as unknown as {
      items: FolderTreeItem[];
    };

    return response.items?.find((item) => item.name === name);
  }

  /**
   * Recursively deletes folders (and their descendant folders) whose name
   * starts with `namePrefix`. Used as a safety net in `afterEach` in case a
   * test failed before its own builder cleanup ran.
   */
  static async cleanup(namePrefix: string): Promise<void> {
    const client = getUmbracoFormsManagementAPI();

    const rootResponse = (await client.getTreeFormRoot({
      foldersOnly: true,
    })) as unknown as { items: FolderTreeItem[] };

    const matches = (rootResponse.items ?? []).filter((item) =>
      item.name.startsWith(namePrefix),
    );

    for (const match of matches) {
      await this.deleteRecursively(match.id);
    }
  }

  private static async deleteRecursively(folderId: string): Promise<void> {
    const client = getUmbracoFormsManagementAPI();

    try {
      const childrenResponse = (await client.getTreeFormChildrenByParentId(folderId, {
        foldersOnly: true,
      })) as unknown as { items: FolderTreeItem[] };

      for (const child of childrenResponse.items ?? []) {
        await this.deleteRecursively(child.id);
      }
    } catch {
      // Ignore failures listing children — fall through to attempt delete.
    }

    try {
      await client.deleteFolderById(folderId, CAPTURE_RAW_HTTP_RESPONSE);
    } catch {
      // Ignore delete failures during cleanup.
    }
  }

  /**
   * Recursively normalizes IDs for snapshot testing.
   */
  static normalizeIds(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeIds(item));
    }

    if (data && typeof data === "object") {
      const normalized: Record<string, any> = { ...data };
      if (normalized.id) {
        normalized.id = "00000000-0000-0000-0000-000000000000";
      }
      if (normalized.parentId) {
        normalized.parentId = "00000000-0000-0000-0000-000000000000";
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
}
