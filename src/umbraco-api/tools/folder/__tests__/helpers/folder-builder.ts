/**
 * Folder Builder
 *
 * Fluent builder for creating Umbraco Forms folders as test data. Mirrors the
 * create-folder tool's behaviour: the folder ID is generated client-side
 * (Umbraco Forms' folder POST endpoint requires a client-supplied ID) rather
 * than being extracted from a Location header.
 */

import { randomUUID } from "node:crypto";
import { CAPTURE_RAW_HTTP_RESPONSE, type HttpResponse } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../../api/generated/umbracoFormsManagementApi.js";

export const TEST_FOLDER_NAME = "_Test Folder";

interface FolderModel {
  id: string;
  name: string;
  parentId?: string | null;
}

export class FolderBuilder {
  private model: FolderModel = {
    id: randomUUID(),
    name: TEST_FOLDER_NAME,
    parentId: null,
  };

  private createdId?: string;

  withName(name: string): this {
    this.model.name = name;
    return this;
  }

  withParentId(parentId: string): this {
    this.model.parentId = parentId;
    return this;
  }

  build(): FolderModel {
    return { ...this.model };
  }

  async create(): Promise<this> {
    const client = getUmbracoFormsManagementAPI();
    const response = (await client.postFolder(
      this.model,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as unknown as HttpResponse;

    if (response.status < 200 || response.status >= 300) {
      throw new Error(
        `Failed to create folder: HTTP ${response.status} ${JSON.stringify(response.data)}`,
      );
    }

    this.createdId = this.model.id;
    return this;
  }

  async delete(): Promise<void> {
    if (!this.createdId) return;
    const client = getUmbracoFormsManagementAPI();
    try {
      await client.deleteFolderById(this.createdId, CAPTURE_RAW_HTTP_RESPONSE);
    } catch {
      // Ignore delete failures in cleanup — the instance is shared and the
      // folder may already have been removed by the test itself.
    }
    this.createdId = undefined;
  }

  getId(): string {
    if (!this.createdId) {
      throw new Error("Folder not created yet. Call create() first.");
    }
    return this.createdId;
  }
}
