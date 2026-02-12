import { v4 as uuid } from "uuid";
import {
  getApiClient,
  CAPTURE_RAW_HTTP_RESPONSE,
} from "@umbraco-cms/mcp-server-sdk";
import type {
  getUmbracoFormsManagementAPI,
  FormDesign,
  FieldTypeWithSettings,
  EntrySearchResultCollection,
} from "../../../../api/generated/umbracoFormsManagementApi.js";
import { getUmbracoFormsDeliveryAPI } from "../../../../api/generated/umbracoFormsDeliveryApi.js";
import { deliveryInstance } from "../../../../api/delivery-client.js";

type ManagementApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;
type DeliveryApiClient = ReturnType<typeof getUmbracoFormsDeliveryAPI>;

const TEST_RECORD_FORM_NAME = "_Test Record Form";

export class RecordBuilder {
  private formName: string;
  private fieldValue: string;
  private createdFormId?: string;
  private createdRecordUniqueId?: string;

  constructor() {
    this.formName = TEST_RECORD_FORM_NAME;
    this.fieldValue = "Test Value";
  }

  withFormName(name: string): this {
    this.formName = name;
    return this;
  }

  withFieldValue(value: string): this {
    this.fieldValue = value;
    return this;
  }

  async create(): Promise<this> {
    const client = getApiClient<ManagementApiClient>();

    // Step 1: Look up a field type
    const fieldTypes = await client.getFieldType();
    const fieldTypeArray = fieldTypes as any as FieldTypeWithSettings[];

    // Find "Short answer" or use the first one
    const fieldType =
      fieldTypeArray.find((t) => t.name === "Short answer") ||
      fieldTypeArray[0];

    if (!fieldType) {
      throw new Error("No field types available");
    }

    // Step 2: Create a form with a text field
    const now = new Date().toISOString();
    const formId = uuid();
    const pageId = uuid();
    const fieldSetId = uuid();
    const containerId = uuid();
    const fieldId = uuid();

    const formModel: FormDesign = {
      id: formId,
      unique: formId,
      entityType: "Form",
      name: this.formName,
      created: now,
      createdBy: null,
      createdByName: null,
      updated: now,
      updatedBy: null,
      updatedByName: null,
      pages: [
        {
          id: pageId,
          caption: null,
          sortOrder: 0,
          form: formId,
          fieldSets: [
            {
              id: fieldSetId,
              caption: null,
              sortOrder: 0,
              page: pageId,
              containers: [
                {
                  id: containerId,
                  caption: null,
                  width: 12,
                  fields: [
                    {
                      caption: "Name",
                      alias: "name",
                      id: fieldId,
                      fieldTypeId: fieldType.id,
                      prevalueSourceId: "00000000-0000-0000-0000-000000000000",
                      containsSensitiveData: false,
                      mandatory: false,
                      settings: {},
                      preValues: [],
                      allowMultipleFileUploads: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      validationRules: [],
      fieldIndicationType: "MarkMandatoryFields",
      indicator: "*",
      showValidationSummary: false,
      hideFieldValidation: false,
      requiredErrorMessage: "",
      invalidErrorMessage: "",
      messageOnSubmit: null,
      messageOnSubmitIsHtml: false,
      goToPageOnSubmit: null,
      xPathOnSubmit: null,
      manualApproval: false,
      storeRecordsLocally: true,
      autocompleteAttribute: null,
      displayDefaultFields: true,
      selectedDisplayFields: [],
      daysToRetainSubmittedRecordsFor: 0,
      daysToRetainApprovedRecordsFor: 0,
      daysToRetainRejectedRecordsFor: 0,
      cssClass: null,
      disableDefaultStylesheet: false,
      datasource: null,
      submitLabel: null,
      nextLabel: null,
      prevLabel: null,
      folderId: null,
      nodeId: 0,
      showPagingOnMultiPageForms: "None",
      pagingDetailsFormat: "",
      pageCaptionFormat: "",
      showSummaryPageOnMultiPageForms: false,
      summaryLabel: null,
      formWorkflows: {
        onSubmit: [],
        onApprove: [],
        onReject: [],
      },
      path: "",
    };

    const formResponse = await client.postForm(
      formModel as any,
      CAPTURE_RAW_HTTP_RESPONSE
    );

    // Extract form ID from Location header
    const locationHeader =
      (formResponse as any)?.headers?.location ||
      (formResponse as any)?.headers?.Location;
    this.createdFormId = locationHeader
      ? locationHeader.split("/").pop()
      : formId;

    if (!this.createdFormId) {
      throw new Error("Failed to create form - no form ID returned");
    }

    // Step 3: Submit an entry via Delivery API
    await deliveryInstance<void>(
      {
        url: `/umbraco/forms/delivery/api/v1/entries/${this.createdFormId}`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: {
          values: { name: [this.fieldValue] },
        },
      },
      { returnFullResponse: true } as any
    );

    // Step 4: List records to get the created record's uniqueId
    const recordsResponse = await client.getFormByFormIdRecord(
      this.createdFormId,
      { take: 10 }
    );

    const collection = recordsResponse as any as EntrySearchResultCollection;
    if (!collection.results || collection.results.length === 0) {
      throw new Error("Record was not created");
    }

    this.createdRecordUniqueId = collection.results[0].uniqueId;

    return this;
  }

  getFormId(): string {
    if (!this.createdFormId) {
      throw new Error("Record not created yet. Call create() first.");
    }
    return this.createdFormId;
  }

  getRecordId(): string {
    if (!this.createdRecordUniqueId) {
      throw new Error("Record not created yet. Call create() first.");
    }
    return this.createdRecordUniqueId;
  }

  getFieldValue(): string {
    return this.fieldValue;
  }
}
