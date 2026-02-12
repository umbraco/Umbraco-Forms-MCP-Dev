import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { configureApiClient } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { FolderBuilder } from "./helpers/folder-builder.js";
import { FolderTestHelper } from "./helpers/folder-test-helper.js";

configureApiClient(() => getUmbracoFormsManagementAPI());

export {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FolderBuilder,
  FolderTestHelper,
};
