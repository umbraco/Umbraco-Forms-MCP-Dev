import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { configureApiClient, initializeUmbracoFetch, CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { FormBuilder } from "../../form/__tests__/helpers/form-builder.js";
import { FormTestHelper } from "../../form/__tests__/helpers/form-test-helper.js";
import { purgeFolder, purgeForm } from "../../../../testing/purge.js";

// Initialize fetch with credentials — required for integration tests hitting the real API
initializeUmbracoFetch({
  baseUrl: process.env.UMBRACO_BASE_URL!,
  clientId: process.env.UMBRACO_CLIENT_ID!,
  clientSecret: process.env.UMBRACO_CLIENT_SECRET!,
});

configureApiClient(() => getUmbracoFormsManagementAPI());

/** Moves a form or folder to the recycle bin, as delete-form / delete-folder do. */
async function trashForm(id: string): Promise<void> {
  await getUmbracoFormsManagementAPI().deleteFormById(id, CAPTURE_RAW_HTTP_RESPONSE);
}

async function trashFolder(id: string): Promise<void> {
  await getUmbracoFormsManagementAPI().deleteFolderById(id, CAPTURE_RAW_HTTP_RESPONSE);
}

const UNKNOWN_ID = "00000000-0000-0000-0000-000000000001";

export {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  validateToolResponse,
  FormBuilder,
  FormTestHelper,
  purgeForm,
  purgeFolder,
  trashForm,
  trashFolder,
  UNKNOWN_ID,
};
