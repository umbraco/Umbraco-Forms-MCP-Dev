import { v4 as uuid } from "uuid";
import {
  getApiClient,
  CAPTURE_RAW_HTTP_RESPONSE,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const TEST_FOLDER_NAME = "_Test Folder";

interface FolderModel {
  id: string;
  name: string;
  parentId?: string | null;
}

export class FolderBuilder {
  private model: FolderModel;
  private createdId?: string;

  constructor() {
    this.model = {
      id: uuid(),
      name: TEST_FOLDER_NAME,
      parentId: null,
    };
  }

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
    const client = getApiClient<ApiClient>();

    const response = await client.postFolder(
      this.model as any,
      CAPTURE_RAW_HTTP_RESPONSE
    );

    // Extract ID from Location header
    const locationHeader =
      (response as any)?.headers?.location ||
      (response as any)?.headers?.Location;
    this.createdId = locationHeader
      ? locationHeader.split("/").pop()
      : this.model.id;

    return this;
  }

  getId(): string {
    if (!this.createdId) {
      throw new Error("Folder not created yet. Call create() first.");
    }
    return this.createdId;
  }

  getItem(): FolderModel {
    return this.build();
  }
}
