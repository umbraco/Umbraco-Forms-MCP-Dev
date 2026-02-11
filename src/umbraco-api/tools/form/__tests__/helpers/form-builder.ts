import { v4 as uuid } from "uuid";
import {
  getApiClient,
  CAPTURE_RAW_HTTP_RESPONSE,
} from "@umbraco-cms/mcp-server-sdk";
import type {
  getUmbracoFormsManagementAPI,
  FormDesign,
} from "../../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const TEST_FORM_NAME = "_Test Form";

export class FormBuilder {
  private model: FormDesign;
  private createdId?: string;

  constructor() {
    const now = new Date().toISOString();
    const formId = uuid();
    const pageId = uuid();

    this.model = {
      id: formId,
      unique: formId,
      entityType: "Form",
      name: TEST_FORM_NAME,
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
          fieldSets: [],
          form: formId,
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
  }

  withName(name: string): this {
    this.model.name = name;
    return this;
  }

  withFolderId(folderId: string | null): this {
    this.model.folderId = folderId;
    return this;
  }

  build(): FormDesign {
    return { ...this.model };
  }

  async create(): Promise<this> {
    const client = getApiClient<ApiClient>();

    const response = await client.postForm(
      this.model as any,
      CAPTURE_RAW_HTTP_RESPONSE
    );

    // Extract ID from Location header
    const locationHeader =
      (response as any)?.headers?.location ||
      (response as any)?.headers?.Location;
    this.createdId = locationHeader
      ? locationHeader.split("/").pop()
      : this.model.id;

    return this;
  }

  getId(): string {
    if (!this.createdId) {
      throw new Error("Form not created yet. Call create() first.");
    }
    return this.createdId;
  }

  getItem(): FormDesign {
    return this.build();
  }
}
