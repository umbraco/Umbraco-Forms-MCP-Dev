import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  getStructuredContent,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { jest } from "@jest/globals";
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

// The data source list endpoint is unpaged (take=2147483647), so a create +
// list round trip regularly overruns Jest's 5s default on a remote instance.
jest.setTimeout(30000);

export {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  getStructuredContent,
  DataSourceBuilder,
  DataSourceTestHelper,
  TEST_DATA_SOURCE_NAME,
  SQL_DATA_SOURCE_TYPE_ID,
  DEFAULT_DATA_SOURCE_SETTINGS,
};
