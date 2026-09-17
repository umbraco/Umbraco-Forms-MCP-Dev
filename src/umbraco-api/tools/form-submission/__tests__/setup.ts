import { jest } from "@jest/globals";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { configureApiClient, initializeUmbracoFetch } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

// Re-use the form collection's cleanup/normalize helper — form-submission
// tests still create and tear down real Forms, just via the Delivery API.
import { FormTestHelper } from "../../form/__tests__/helpers/form-test-helper.js";
import { FormSubmissionBuilder } from "./helpers/form-submission-builder.js";

// Initialize fetch with credentials — required for integration tests hitting the real API
initializeUmbracoFetch({
  baseUrl: process.env.UMBRACO_BASE_URL!,
  clientId: process.env.UMBRACO_CLIENT_ID!,
  clientSecret: process.env.UMBRACO_CLIENT_SECRET!,
});

configureApiClient(() => getUmbracoFormsManagementAPI());

// Form submission tests involve form creation + Delivery API calls
jest.setTimeout(60000);

export {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FormTestHelper,
  FormSubmissionBuilder,
};
