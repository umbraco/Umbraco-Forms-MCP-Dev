/**
 * Real entries (records) for the record tool tests.
 *
 * Two ways in, because they behave differently:
 * - `createEntry` uses the Management API's create-record endpoint (Forms 17.6 / 18.2):
 *   the entry is stored as Submitted and no workflows run.
 * - `submitEntryWithWorkflow` posts through the Delivery API, like a site visitor:
 *   the form's workflows run (and are recorded in the workflow audit trail) and,
 *   without manual approval, the entry ends up Approved.
 */

import {
  getUmbracoFormsManagementAPI,
  type EntrySearchResult,
  type EntrySearchResultCollection,
} from "../../../../api/generated/umbracoFormsManagementApi.js";
import { getUmbracoFormsDeliveryAPI } from "../../../../api/generated/umbracoFormsDeliveryApi.js";
import { FormBuilder } from "../../../form/__tests__/helpers/form-builder.js";

export const TEST_WORKFLOW_FORM_NAME = "_Test Record Workflow Form";

export class RecordEntryHelper {
  /** Adds an entry through the Management API and returns its ID. */
  static async createEntry(formId: string, fieldId: string, value: string): Promise<string> {
    const response = (await getUmbracoFormsManagementAPI().postFormByFormIdRecord(formId, [
      { fieldId, values: [value] },
    ])) as unknown as { id?: string };
    if (!response?.id) throw new Error(`create-record returned no ID for form ${formId}`);
    return response.id;
  }

  /**
   * Creates a form with a "Send email" workflow, submits one entry through the
   * Delivery API so the workflow runs, and returns the form's builder (for
   * cleanup) and the entry's ID.
   */
  static async submitEntryWithWorkflow(): Promise<{ builder: FormBuilder; recordId: string }> {
    const builder = await new FormBuilder().withName(TEST_WORKFLOW_FORM_NAME).withOnSubmitWorkflow().create();
    await getUmbracoFormsDeliveryAPI().postUmbracoFormsDeliveryApiV1EntriesId(builder.getId(), {
      values: { dataConsent: ["true"] },
    });

    const [entry] = await RecordEntryHelper.getEntries(builder.getId());
    if (!entry) throw new Error("The Delivery API submission did not store an entry");
    return { builder, recordId: entry.uniqueId };
  }

  /** The form's entries, newest first. */
  static async getEntries(formId: string): Promise<EntrySearchResult[]> {
    const collection = (await getUmbracoFormsManagementAPI().getFormByFormIdRecord(
      formId,
    )) as EntrySearchResultCollection;
    return collection.results;
  }

  static async getEntry(formId: string, recordId: string): Promise<EntrySearchResult | undefined> {
    return (await RecordEntryHelper.getEntries(formId)).find((entry) => entry.uniqueId === recordId);
  }
}
