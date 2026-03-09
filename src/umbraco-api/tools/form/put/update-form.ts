import { z } from "zod";
import { v4 as uuid } from "uuid";
import {
  withStandardDecorators,
  getApiClient,
  createToolResult,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { fieldSchema, pageSchema, workflowsSchema, buildField, buildPage, buildFormWorkflows, collectExistingFields } from "../field-helpers.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: z.string().uuid().describe("The ID of the form to update. Use list-forms or get-form-tree to find form IDs."),
  name: z.string().optional().describe("New name for the form"),
  messageOnSubmit: z.string().optional().describe("Message shown after form submission"),
  submitLabel: z.string().optional().describe("Label for the submit button"),
  fields: z.array(fieldSchema).optional().describe("Fields to set on the form. Replaces all existing fields on page 1, in the first group. Cannot be used with 'pages'."),
  pages: z.array(pageSchema).optional().describe("Pages with fields. Replaces ALL existing pages. Each page gets one group with all its fields. Cannot be used with 'fields'."),
  workflows: workflowsSchema.optional().describe("Form workflows. Replaces ALL existing workflows for the specified stages (onSubmit, onApprove, onReject). Only provide the stages you want to replace."),
};

const outputSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const UpdateFormTool = {
  name: "update-form",
  description: "Update a form's properties, fields, and/or workflows. Fetches the current form state, applies your changes, and saves. Only provide properties you want to modify. When 'fields' is provided, all existing fields on page 1 are replaced. When 'pages' is provided, ALL pages are replaced. When 'workflows' is provided, workflows are replaced for the specified stages only. Existing field IDs are preserved when matched by alias. Do not provide both 'fields' and 'pages'.",
  inputSchema,
  outputSchema,
  slices: ["update"],
  annotations: {
    idempotentHint: true,
  },
  handler: async (params) => {
    if (params.fields && params.pages) {
      throw new Error("Cannot provide both 'fields' and 'pages'. Use 'fields' to replace fields on page 1, or 'pages' to replace all pages.");
    }

    const client = getApiClient<ApiClient>();

    // Fetch existing form
    const existing = await client.getFormById(params.id) as any;

    // Merge basic property changes
    const updated = {
      ...existing,
      ...(params.name !== undefined ? { name: params.name } : {}),
      ...(params.messageOnSubmit !== undefined ? { messageOnSubmit: params.messageOnSubmit } : {}),
      ...(params.submitLabel !== undefined ? { submitLabel: params.submitLabel } : {}),
      updated: new Date().toISOString(),
    };

    // Replace all pages if 'pages' is provided
    if (params.pages) {
      const formId = updated.id;
      updated.pages = params.pages.map((page, index) =>
        buildPage(page, index, formId, existing.pages)
      );
    }
    // Otherwise replace fields on page 1 if 'fields' is provided
    else if (params.fields && updated.pages?.[0]) {
      const page = updated.pages[0];
      const pageId = page.id;

      // Collect existing fields from page 1 for ID preservation
      const existingFields = collectExistingFields([page]);
      const fields = params.fields.map((field, index) => buildField(field, index, existingFields));

      // Preserve existing fieldSet/container IDs where possible
      const existingFieldSet = page.fieldSets?.[0];
      const fieldSet = {
        id: existingFieldSet?.id || uuid(),
        caption: null,
        sortOrder: 0,
        page: pageId,
        containers: [
          {
            id: existingFieldSet?.containers?.[0]?.id || uuid(),
            caption: null,
            width: 12,
            fields: fields,
          },
        ],
        condition: null,
      };

      page.fieldSets = [fieldSet];
    }

    // Replace workflows for specified stages
    if (params.workflows) {
      updated.formWorkflows = buildFormWorkflows(params.workflows, updated.id, updated.formWorkflows);
    }

    await client.putFormById(params.id, updated as any, CAPTURE_RAW_HTTP_RESPONSE);
    return createToolResult({ id: params.id, name: updated.name });
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(UpdateFormTool);
