import { jest } from "@jest/globals";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { configureApiClient } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { RecordBuilder } from "./helpers/record-builder.js";
import { RecordTestHelper } from "./helpers/record-test-helper.js";

configureApiClient(() => getUmbracoFormsManagementAPI());

// Record operations involve form creation + submission + querying, so allow extra time
jest.setTimeout(60000);

export {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  RecordBuilder,
  RecordTestHelper,
};
