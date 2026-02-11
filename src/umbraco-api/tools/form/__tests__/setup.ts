import { jest } from "@jest/globals";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { configureApiClient } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { FormBuilder } from "./helpers/form-builder.js";
import { FormTestHelper } from "./helpers/form-test-helper.js";

configureApiClient(() => getUmbracoFormsManagementAPI());

// Form API calls can be slow against a real Umbraco instance
jest.setTimeout(30000);

export {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FormBuilder,
  FormTestHelper,
};
