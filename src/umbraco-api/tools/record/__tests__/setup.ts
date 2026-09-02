import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { configureApiClient, initializeUmbracoFetch } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { RecordTestFormHelper } from "./helpers/record-test-form-helper.js";

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
  validateToolResponse,
  RecordTestFormHelper,
};
