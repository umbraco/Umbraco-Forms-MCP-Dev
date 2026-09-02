import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "@umbraco-cms/mcp-server-sdk/testing";
import {
  configureApiClient,
  initializeUmbracoFetch,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  DataSourceBuilder,
  TEST_DATA_SOURCE_NAME,
  SQL_DATA_SOURCE_TYPE_ID,
  DEFAULT_DATA_SOURCE_SETTINGS,
} from "./helpers/data-source-builder.js";
import { DataSourceTestHelper } from "./helpers/data-source-test-helper.js";

// Initialize fetch with credentials — required for integration tests hitting the real API
initializeUmbracoFetch({
  baseUrl: process.env.UMBRACO_BASE_URL!,
  clientId: process.env.UMBRACO_CLIENT_ID!,
  clientSecret: process.env.UMBRACO_CLIENT_SECRET!,
});

configureApiClient(() => getUmbracoFormsManagementAPI());

export {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  DataSourceBuilder,
  DataSourceTestHelper,
  TEST_DATA_SOURCE_NAME,
  SQL_DATA_SOURCE_TYPE_ID,
  DEFAULT_DATA_SOURCE_SETTINGS,
};
