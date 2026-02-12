import { jest } from "@jest/globals";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { configureApiClient } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

// Re-use record builder/helper since form submissions create records
import { RecordBuilder } from "../../record/__tests__/helpers/record-builder.js";
import { RecordTestHelper } from "../../record/__tests__/helpers/record-test-helper.js";

configureApiClient(() => getUmbracoFormsManagementAPI());

// Form submission tests involve form creation + delivery API calls
jest.setTimeout(60000);

export {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  RecordBuilder,
  RecordTestHelper,
};
