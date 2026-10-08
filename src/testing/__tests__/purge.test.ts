/**
 * purgeForm / purgeFolder must leave nothing behind - not even in the recycle
 * bin Forms 17.6 / 18.2 move deleted items into - and must never throw.
 */

import { configureApiClient, initializeUmbracoFetch, CAPTURE_RAW_HTTP_RESPONSE, type HttpResponse } from "@umbraco-cms/mcp-server-sdk";
import { setupTestEnvironment } from "@umbraco-cms/mcp-server-sdk/testing";
import { getUmbracoFormsManagementAPI } from "../../umbraco-api/api/generated/umbracoFormsManagementApi.js";
import { FormBuilder } from "../../umbraco-api/tools/form/__tests__/helpers/form-builder.js";
import { FormTestHelper } from "../../umbraco-api/tools/form/__tests__/helpers/form-test-helper.js";
import { purgeFolder, purgeForm } from "../purge.js";

initializeUmbracoFetch({
  baseUrl: process.env.UMBRACO_BASE_URL!,
  clientId: process.env.UMBRACO_CLIENT_ID!,
  clientSecret: process.env.UMBRACO_CLIENT_SECRET!,
});
configureApiClient(() => getUmbracoFormsManagementAPI());

async function status(call: Promise<unknown>): Promise<number> {
  return ((await call) as HttpResponse).status;
}

describe("purge", () => {
  setupTestEnvironment();

  const client = getUmbracoFormsManagementAPI();

  it("should remove a form for good", async () => {
    const formId = (await new FormBuilder().withName("_Test Purge Form").create()).getId();

    await purgeForm(formId);

    expect(await status(client.getFormById(formId, undefined, CAPTURE_RAW_HTTP_RESPONSE))).toBe(404);
  });

  it("should remove a folder and the forms inside it for good", async () => {
    const folderId = await FormTestHelper.createFolder("_Test Purge Folder");
    const formId = (await new FormBuilder().withName("_Test Purge Folder Form").withFolderId(folderId).create()).getId();

    await purgeFolder(folderId);

    expect(await status(client.getFolderById(folderId, CAPTURE_RAW_HTTP_RESPONSE))).toBe(404);
    expect(await status(client.getFormById(formId, undefined, CAPTURE_RAW_HTTP_RESPONSE))).toBe(404);
  });

  it("should not throw for ids that don't exist", async () => {
    await expect(purgeForm("00000000-0000-0000-0000-000000000001")).resolves.toBeUndefined();
    await expect(purgeFolder("00000000-0000-0000-0000-000000000001")).resolves.toBeUndefined();
  });
});
