/**
 * Helpers for the form version history and audit log tests (Forms 17.6 / 18.2).
 */

import {
  getUmbracoFormsManagementAPI,
  type FormDesign,
  type PagedFormVersionItemResponseModel,
} from "../../../../api/generated/umbracoFormsManagementApi.js";

/** Saves the form under a new name, which stores a new version of it. */
export async function renameForm(id: string, name: string): Promise<void> {
  const client = getUmbracoFormsManagementAPI();
  const form = (await client.getFormById(id)) as FormDesign;
  await client.putFormById(id, { ...form, name });
}

/** The form's version IDs, most recent first. */
export async function getVersionIds(id: string): Promise<string[]> {
  const versions = (await getUmbracoFormsManagementAPI().getFormByIdVersion(id)) as PagedFormVersionItemResponseModel;
  return versions.items.map((version) => version.id);
}
