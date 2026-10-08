/**
 * Test cleanup: removes a form or folder for good.
 *
 * From Umbraco Forms 17.6 / 18.2, `DELETE /form/{id}` and `DELETE /folder/{id}`
 * move the item to the recycle bin, and only `DELETE .../permanent` - which
 * refuses an item that isn't trashed - removes it. Earlier releases delete
 * outright and have no `/permanent` endpoint, so its 404 is ignored there.
 *
 * Errors are swallowed so cleanup never masks a test failure.
 */

import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../umbraco-api/api/generated/umbracoFormsManagementApi.js";

async function ignoreErrors(call: () => Promise<unknown>): Promise<void> {
  try {
    await call();
  } catch {
    // Already gone, never trashed, or a Forms release without a recycle bin.
  }
}

export async function purgeForm(id: string): Promise<void> {
  const client = getUmbracoFormsManagementAPI();
  await ignoreErrors(() => client.deleteFormById(id, CAPTURE_RAW_HTTP_RESPONSE));
  await ignoreErrors(() => client.deleteFormByIdPermanent(id, CAPTURE_RAW_HTTP_RESPONSE));
}

export async function purgeFolder(id: string): Promise<void> {
  const client = getUmbracoFormsManagementAPI();
  await ignoreErrors(() => client.deleteFolderById(id, CAPTURE_RAW_HTTP_RESPONSE));
  await ignoreErrors(() => client.deleteFolderByIdPermanent(id, CAPTURE_RAW_HTTP_RESPONSE));
}
