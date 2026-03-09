import { z } from "zod";
import { v4 as uuid } from "uuid";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";

export const fieldSettingSchema = z.object({
  alias: z.string().describe("Setting alias (e.g. 'FieldType', 'Placeholder', 'AcceptCopy')"),
  value: z.string().describe("Setting value"),
});

export const fieldSchema = z.object({
  caption: z.string().describe("Field label shown to the user"),
  alias: z.string().optional().describe("Field alias for submissions. Auto-generated from caption if omitted."),
  required: z.boolean().optional().describe("Whether the field is mandatory. Defaults to false."),
  requiredErrorMessage: z.string().optional().describe("Error message when required field is empty"),
  fieldTypeId: z.string().uuid().describe("Field type ID. Use list-field-types to find IDs. Common: Short answer=3f92e01b-29e2-4a30-bf33-9df5580ed52c, Long answer=023f09ac-1445-4bcb-b8fa-ab49f33bd046, Data Consent=a72c9df9-3847-47cf-afb8-b86773fd12cd, reCAPTCHA v3=663aa19b-423d-4f38-a1d6-c840c926ef86"),
  settings: z.array(fieldSettingSchema).optional().describe("Field-type-specific settings. Use get-field-type to see available settings for a field type."),
  preValues: z.array(z.string()).optional().describe("List of option values for list-type fields (Checkbox list, Dropdown, Single choice). Each string is one option."),
  regex: z.string().optional().describe("Validation regex pattern"),
  regexErrorMessage: z.string().optional().describe("Error message when regex validation fails"),
  containsSensitiveData: z.boolean().optional().describe("Whether this field contains sensitive data. Defaults to false."),
});

export const pageSchema = z.object({
  caption: z.string().optional().describe("Page caption/title. Optional."),
  fields: z.array(fieldSchema).describe("Fields on this page."),
});

export type FieldInput = z.infer<typeof fieldSchema>;
export type PageInput = z.infer<typeof pageSchema>;

function toSettingsMap(settings?: Array<{ alias: string; value: string }>): Record<string, string> {
  const map: Record<string, string> = {};
  if (settings) {
    for (const s of settings) {
      map[s.alias] = s.value;
    }
  }
  return map;
}

function deriveAlias(caption: string): string {
  return caption.replace(/[^a-zA-Z0-9]/g, "").replace(/^./, (c: string) => c.toLowerCase());
}

/**
 * Build a field for the API. If existingFields is provided, preserves IDs for fields
 * matched by alias (or derived alias from caption).
 */
export function buildField(
  field: FieldInput,
  index: number,
  existingFields?: any[],
): any {
  const alias = field.alias || deriveAlias(field.caption);

  // Preserve existing field ID if matched by alias
  const existing = existingFields?.find((f: any) => f.alias === alias);
  const fieldId = existing?.id || uuid();

  const settingsMap = toSettingsMap(field.settings);
  const preValues = (field.preValues || []).map((v) => ({ value: v, caption: v }));

  return {
    id: fieldId,
    caption: field.caption,
    tooltip: null,
    cssClass: null,
    alias: alias,
    fieldTypeId: field.fieldTypeId,
    prevalueSourceId: BLANK_UUID,
    dataSourceFieldKey: null,
    containsSensitiveData: field.containsSensitiveData || false,
    mandatory: field.required || false,
    regex: field.regex || null,
    requiredErrorMessage: field.requiredErrorMessage || null,
    invalidErrorMessage: field.regexErrorMessage || null,
    condition: null,
    settings: settingsMap,
    preValues: preValues,
    allowedUploadTypes: null,
    allowMultipleFileUploads: false,
    sortOrder: index,
  };
}

/**
 * Build a page for the API. If existingPages is provided, preserves IDs for pages
 * matched by index position, and field IDs matched by alias.
 */
export function buildPage(
  page: PageInput,
  pageIndex: number,
  formId: string,
  existingPages?: any[],
): any {
  const existingPage = existingPages?.[pageIndex];
  const pageId = existingPage?.id || uuid();

  // Collect all existing fields across all containers in the matching existing page
  const existingFields: any[] = [];
  if (existingPage?.fieldSets) {
    for (const fs of existingPage.fieldSets) {
      for (const container of fs.containers || []) {
        existingFields.push(...(container.fields || []));
      }
    }
  }

  const fields = page.fields.map((field, index) => buildField(field, index, existingFields));

  return {
    id: pageId,
    caption: page.caption || null,
    sortOrder: pageIndex,
    fieldSets: [
      {
        id: existingPage?.fieldSets?.[0]?.id || uuid(),
        caption: null,
        sortOrder: 0,
        page: pageId,
        containers: [
          {
            id: existingPage?.fieldSets?.[0]?.containers?.[0]?.id || uuid(),
            caption: null,
            width: 12,
            fields: fields,
          },
        ],
        condition: null,
      },
    ],
    form: formId,
    buttonCondition: null,
  };
}

// ============================================================================
// Workflow schemas and builders
// ============================================================================

export const workflowSettingSchema = z.object({
  alias: z.string().describe("Setting alias (e.g. 'Email', 'Subject', 'Message', 'Url')"),
  value: z.string().describe("Setting value"),
});

export const workflowSchema = z.object({
  name: z.string().describe("Display name for this workflow instance"),
  workflowTypeId: z.string().uuid().describe("Workflow type ID. Use list-workflow-types to find IDs."),
  settings: z.array(workflowSettingSchema).optional().describe("Workflow-type-specific settings as alias/value pairs. Use get-workflow-type to see available settings."),
  active: z.boolean().optional().describe("Whether the workflow is active. Defaults to true."),
  includeSensitiveData: z.boolean().optional().describe("Whether to include sensitive data. Defaults to false."),
});

export const workflowsSchema = z.object({
  onSubmit: z.array(workflowSchema).optional().describe("Workflows to run when the form is submitted"),
  onApprove: z.array(workflowSchema).optional().describe("Workflows to run when a record is approved"),
  onReject: z.array(workflowSchema).optional().describe("Workflows to run when a record is rejected"),
});

export type WorkflowInput = z.infer<typeof workflowSchema>;

/**
 * Build workflow entries for the API from simplified input.
 */
export function buildWorkflows(workflows: WorkflowInput[], formId: string): any[] {
  return workflows.map((w, index) => {
    return {
      id: uuid(),
      name: w.name,
      form: formId,
      active: w.active ?? true,
      includeSensitiveData: w.includeSensitiveData ? "True" : "False",
      isDeleted: false,
      sortOrder: index,
      workflowTypeId: w.workflowTypeId,
      workflowTypeName: "",
      workflowTypeDescription: "",
      workflowTypeIcon: "",
      workflowTypeGroup: "",
      settings: toSettingsMap(w.settings),
      isMandatory: false,
      condition: null,
    };
  });
}

/**
 * Build the formWorkflows object from simplified input.
 */
export function buildFormWorkflows(
  workflows: z.infer<typeof workflowsSchema>,
  formId: string,
  existing?: any,
): any {
  const result = existing
    ? { ...existing }
    : { onSubmit: [], onApprove: [], onReject: [] };

  if (workflows.onSubmit) {
    result.onSubmit = buildWorkflows(workflows.onSubmit, formId);
  }
  if (workflows.onApprove) {
    result.onApprove = buildWorkflows(workflows.onApprove, formId);
  }
  if (workflows.onReject) {
    result.onReject = buildWorkflows(workflows.onReject, formId);
  }
  return result;
}

// ============================================================================
// Field collection helpers
// ============================================================================

/**
 * Collect all existing fields from a form's pages structure.
 */
export function collectExistingFields(pages: any[]): any[] {
  const fields: any[] = [];
  for (const page of pages || []) {
    for (const fs of page.fieldSets || []) {
      for (const container of fs.containers || []) {
        fields.push(...(container.fields || []));
      }
    }
  }
  return fields;
}
