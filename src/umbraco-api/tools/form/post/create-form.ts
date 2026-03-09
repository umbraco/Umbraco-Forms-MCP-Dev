import { z } from "zod";
import {
  withStandardDecorators,
  getApiClient,
  createToolResult,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { v4 as uuid } from "uuid";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { fieldSchema, workflowsSchema, buildField, buildFormWorkflows } from "../field-helpers.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  name: z.string().describe("Name for the new form"),
  folderId: z.string().uuid().optional().describe("Optional folder ID to place the form in. If omitted, the form is created at the root."),
  fields: z.array(fieldSchema).optional().describe("Optional fields to add to the form's first page. Saves a separate update-form call."),
  workflows: workflowsSchema.optional().describe("Optional workflows to attach to the form. Saves a separate update-form call."),
};

const outputSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const CreateForm = {
  name: "create-form",
  description: "Create a new Umbraco Form. Optionally include fields and/or workflows to create the form in one step. If no fields are provided, creates an empty form with one blank page. The form ID is generated automatically.",
  inputSchema,
  outputSchema,
  slices: ["create"],
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
  },
  handler: async (params) => {
    const client = getApiClient<ApiClient>();
    const formId = uuid();
    const pageId = uuid();
    const now = new Date().toISOString();

    const fieldSets = params.fields?.length
      ? [
          {
            id: uuid(),
            caption: null,
            sortOrder: 0,
            page: pageId,
            containers: [
              {
                id: uuid(),
                caption: null,
                width: 12,
                fields: params.fields.map((field, index) => buildField(field, index)),
              },
            ],
            condition: null,
          },
        ]
      : [];

    const body = {
      id: formId,
      unique: formId,
      entityType: "Form",
      name: params.name,
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
          fieldSets: fieldSets,
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
      folderId: params.folderId || null,
      nodeId: 0,
      showPagingOnMultiPageForms: "None",
      pagingDetailsFormat: "",
      pageCaptionFormat: "",
      showSummaryPageOnMultiPageForms: false,
      summaryLabel: null,
      formWorkflows: params.workflows
        ? buildFormWorkflows(params.workflows, formId)
        : { onSubmit: [], onApprove: [], onReject: [] },
      path: "",
    };

    const response = await client.postForm(body as any, CAPTURE_RAW_HTTP_RESPONSE);
    const locationHeader = (response as any)?.headers?.location || (response as any)?.headers?.Location;
    const createdId = locationHeader ? locationHeader.split("/").pop() : formId;
    return createToolResult({ id: createdId, name: params.name });
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(CreateForm);
