/**
 * Expands a compact form specification into the full `FormDesign` document the
 * Forms Management API expects.
 *
 * ## Why
 *
 * `POST /form` takes a complete design: 30 required top-level properties, a
 * page -> fieldset -> container -> field nesting four levels deep, and a GUID on
 * every node. Producing that by hand means calling `get-form-scaffold` first and
 * then emitting ~10KB of JSON in which almost every byte is boilerplate — slow
 * to generate and easy to get wrong.
 *
 * Everything in that payload is either a constant, derivable from the fields
 * themselves, or a GUID that just has to be unique. So it is generated here
 * instead, and the caller supplies only what is genuinely a decision: the form
 * name and its list of fields.
 *
 * `create-form` remains the escape hatch for designs this cannot express —
 * conditions, workflows, multi-page forms, custom field types.
 */

import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { FormDesign } from "../../api/generated/umbracoFormsManagementApi.js";
import {
  FIELD_TYPE_ALIAS_NAMES,
  FIELD_TYPE_ALIASES,
} from "./form-field-types.js";
import { normalizePages } from "./form-pages-schema.js";

/** An option in a dropdown / radio / checkbox list. */
const optionSchema = z.union([
  z.string().describe("Shown to the user and stored as the value."),
  z.object({
    value: z.string().describe("Value stored in the submission."),
    caption: z.string().describe("Label shown to the user."),
  }),
]);

/** One field in the compact spec. */
export const simpleFieldSchema = z.object({
  label: z
    .string()
    .min(1)
    .describe("Field label shown to the user, e.g. 'Email address'."),
  type: z
    .enum(FIELD_TYPE_ALIAS_NAMES)
    .describe(
      `Field type. One of: ${FIELD_TYPE_ALIAS_NAMES.join(", ")}. Use create-form with an explicit fieldTypeId for custom field types.`,
    ),
  required: z.boolean().optional().describe("Whether the field is mandatory. Default false."),
  group: z
    .string()
    .optional()
    .describe(
      "Fieldset caption to group this field under. Consecutive fields sharing a group land in the same fieldset; omit for an ungrouped fieldset.",
    ),
  alias: z
    .string()
    .optional()
    .describe("Field alias. Derived from the label when omitted."),
  placeholder: z.string().optional().describe("HTML5 placeholder text."),
  helpText: z.string().optional().describe("Tooltip / help text shown with the field."),
  defaultValue: z.string().optional().describe("Pre-filled value."),
  options: z
    .array(optionSchema)
    .optional()
    .describe("Choices for dropdown, radio and checkboxList fields."),
  maxLength: z.number().int().positive().optional().describe("Maximum accepted characters."),
  rows: z.number().int().positive().optional().describe("Row count for a textarea."),
  pattern: z
    .string()
    .optional()
    .describe("Regular expression the value must match, e.g. '^[0-9]{8}$'."),
  sensitive: z
    .boolean()
    .optional()
    .describe("Marks the field as containing sensitive data, which restricts who can view submissions."),
  requiredErrorMessage: z.string().optional().describe("Message shown when a mandatory field is empty."),
  invalidErrorMessage: z.string().optional().describe("Message shown when the value fails validation."),
  bodyText: z
    .string()
    .optional()
    .describe("Body copy for the display-only 'title' and 'richText' types."),
  settings: z
    .record(z.string(), z.string())
    .optional()
    .describe("Escape hatch: raw field-type settings, merged last and overriding anything derived above."),
});

export type SimpleFieldSpec = z.infer<typeof simpleFieldSchema>;

/** The compact form spec, as a Zod shape for a tool's `inputSchema`. */
export const simpleFormShape = {
  name: z.string().min(1).describe("Form name, e.g. 'Contact us'."),
  fields: z
    .array(simpleFieldSchema)
    .min(1)
    .describe("Fields in display order. Grouped into fieldsets via each field's optional 'group'."),
  pageCaption: z.string().optional().describe("Caption for the form's single page."),
  submitLabel: z.string().optional().describe("Submit button text. Default 'Submit'."),
  messageOnSubmit: z
    .string()
    .optional()
    .describe("Message shown after a successful submission. Default 'Thank you'."),
  markMandatoryFields: z
    .boolean()
    .optional()
    .describe("Show an indicator next to mandatory fields. Default true."),
  showValidationSummary: z
    .boolean()
    .optional()
    .describe("Show a summary of validation errors above the form. Default true."),
  storeRecordsLocally: z
    .boolean()
    .optional()
    .describe("Store submissions in Umbraco. Default true."),
  daysToRetainSubmittedRecordsFor: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("Days to retain submissions; 0 means keep indefinitely. Default 0."),
  folderId: z.string().optional().describe("Forms-tree folder to create the form in."),
  id: z
    .string()
    .optional()
    .describe("Form GUID. Generated when omitted — only set this to control the ID."),
};

/** Turns a label into a camelCase alias unique within the form. */
function deriveAlias(label: string, taken: Set<string>): string {
  const words = label
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/[\s-]+/)
    .filter(Boolean);

  let base =
    words
      .map((word, index) =>
        index === 0
          ? word.charAt(0).toLowerCase() + word.slice(1)
          : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join("") || "field";

  // An alias must not start with a digit.
  if (/^\d/.test(base)) base = `field${base}`;

  let candidate = base;
  let suffix = 2;
  while (taken.has(candidate)) candidate = `${base}${suffix++}`;
  taken.add(candidate);
  return candidate;
}

/** Normalizes the two accepted option shapes into the API's `{value, caption}`. */
function buildPreValues(
  options: SimpleFieldSpec["options"],
): Array<{ value: string; caption: string }> {
  if (!options) return [];
  return options.map((option) =>
    typeof option === "string"
      ? { value: option, caption: option }
      : { value: option.value, caption: option.caption },
  );
}

/**
 * Builds one field node of the design.
 *
 * `takenAliases` is mutated to reserve the alias this field ends up with, so a
 * caller adding fields to an existing form can seed it with the aliases already
 * in use and get collision-free names back.
 */
export function buildField(spec: SimpleFieldSpec, takenAliases: Set<string>) {
  const mapping = FIELD_TYPE_ALIASES[spec.type];
  if (!mapping) {
    throw new Error(
      `Unknown field type '${spec.type}'. Expected one of: ${FIELD_TYPE_ALIAS_NAMES.join(", ")}.`,
    );
  }

  const settings: Record<string, string> = {
    ...mapping.settings,
    ShowLabel: "True",
  };

  if (mapping.autocomplete) settings.AutocompleteAttribute = mapping.autocomplete;
  if (spec.placeholder) settings.Placeholder = spec.placeholder;
  if (spec.defaultValue) settings.DefaultValue = spec.defaultValue;
  if (spec.maxLength !== undefined) settings.MaximumLength = String(spec.maxLength);
  if (spec.rows !== undefined) settings.NumberOfRows = String(spec.rows);

  // Display-only types carry their copy in settings rather than as a value.
  if (spec.type === "title") {
    settings.CaptionTag = "h3";
    settings.Caption = spec.label;
    if (spec.bodyText) settings.BodyText = spec.bodyText;
    settings.ShowLabel = "False";
  }
  if (spec.type === "richText") {
    if (spec.bodyText) settings.Html = spec.bodyText;
    settings.ShowLabel = "False";
  }
  if (spec.type === "consent") {
    settings.AcceptCopy = spec.bodyText ?? spec.label;
  }
  if (spec.type === "checkbox" && spec.bodyText) {
    settings.Caption = spec.bodyText;
  }
  if (mapping.supportsOptions) {
    settings.SelectPrompt ??= `Select ${spec.label.toLowerCase()}`;
    if (spec.type === "radio" || spec.type === "checkboxList") {
      delete settings.SelectPrompt;
      settings.DisplayLayout = "Vertical";
    } else {
      settings.AllowMultipleSelections = "False";
    }
  }

  // Caller-supplied settings win over everything derived above.
  Object.assign(settings, spec.settings ?? {});

  // Reserve an explicit alias too, so a later field's derived alias cannot
  // collide with it.
  let alias: string;
  if (spec.alias) {
    alias = spec.alias;
    takenAliases.add(alias);
  } else {
    alias = deriveAlias(spec.label, takenAliases);
  }

  return {
    id: randomUUID(),
    caption: spec.label,
    alias,
    fieldTypeId: mapping.fieldTypeId,
    // Display-only fields can never be mandatory.
    mandatory: mapping.displayOnly ? false : (spec.required ?? false),
    containsSensitiveData: spec.sensitive ?? false,
    tooltip: spec.helpText ?? null,
    cssClass: null,
    regex: spec.pattern ?? null,
    requiredErrorMessage: spec.requiredErrorMessage ?? null,
    invalidErrorMessage: spec.invalidErrorMessage ?? null,
    condition: null,
    prevalueSourceId: "00000000-0000-0000-0000-000000000000",
    dataSourceFieldKey: null,
    settings,
    preValues: buildPreValues(spec.options),
    allowedUploadTypes: null,
    allowMultipleFileUploads: false,
    mappedMemberPropertyAlias: null,
    memberPrefillMode: "None",
  };
}

export type SimpleFormSpec = {
  [K in keyof typeof simpleFormShape]: z.infer<(typeof simpleFormShape)[K]>;
};

/**
 * Expands the compact spec into a complete `FormDesign`.
 *
 * Fields are grouped into fieldsets by their `group`, preserving the order they
 * were given in: a new fieldset starts whenever the group changes, so repeating
 * a group name later in the list produces a second fieldset with that caption
 * rather than reordering fields to merge them.
 */
export function buildFormDesign(spec: SimpleFormSpec): FormDesign {
  const formId = spec.id ?? randomUUID();
  const pageId = randomUUID();
  const takenAliases = new Set<string>();

  // Group consecutive fields sharing a `group` into one fieldset.
  const groups: Array<{ caption: string | null; fields: SimpleFieldSpec[] }> = [];
  for (const field of spec.fields) {
    const caption = field.group ?? null;
    const current = groups[groups.length - 1];
    if (current && current.caption === caption) current.fields.push(field);
    else groups.push({ caption, fields: [field] });
  }

  const fieldSets = groups.map((group, index) => ({
    id: randomUUID(),
    caption: group.caption,
    sortOrder: index,
    page: pageId,
    condition: null,
    containers: [
      {
        id: randomUUID(),
        caption: null,
        width: 12,
        fields: group.fields.map((field) => buildField(field, takenAliases)),
      },
    ],
  }));

  return {
    ...formDesignDefaults(formId),
    name: spec.name,
    folderId: spec.folderId ?? null,
    pages: [
      {
        id: pageId,
        form: formId,
        caption: spec.pageCaption ?? null,
        sortOrder: 0,
        condition: null,
        buttonCondition: null,
        fieldSets,
      },
    ],
    fieldIndicationType:
      (spec.markMandatoryFields ?? true) ? "MarkMandatoryFields" : "NoIndicator",
    showValidationSummary: spec.showValidationSummary ?? true,
    messageOnSubmit: spec.messageOnSubmit ?? "Thank you",
    storeRecordsLocally: spec.storeRecordsLocally ?? true,
    daysToRetainSubmittedRecordsFor: spec.daysToRetainSubmittedRecordsFor ?? 0,
    submitLabel: spec.submitLabel ?? "Submit",
  } as unknown as FormDesign;
}

/**
 * Every `FormDesign` property the API requires but which carries no design
 * decision: constants, timestamps, and identifiers that only have to be unique.
 *
 * Used both to build a form from a compact spec and to backfill a partial
 * design passed to `create-form` / `update-form`, so neither tool forces the
 * caller to retype 28 properties of boilerplate.
 */
export function formDesignDefaults(formId: string): Record<string, unknown> {
  const now = new Date().toISOString();

  return {
    id: formId,
    unique: formId,
    entityType: "form",
    name: "",
    path: "",
    created: now,
    updated: now,
    nodeId: 0,
    folderId: null,
    pages: [],
    formWorkflows: { onSubmit: [], onApprove: [], onReject: [] },
    validationRules: [],
    selectedDisplayFields: [],
    fieldIndicationType: "MarkMandatoryFields",
    indicator: "*",
    showValidationSummary: true,
    hideFieldValidation: false,
    requiredErrorMessage: "Please provide a value for {0}",
    invalidErrorMessage: "Please provide a valid value for {0}",
    messageOnSubmit: "Thank you",
    messageOnSubmitIsHtml: false,
    manualApproval: false,
    storeRecordsLocally: true,
    displayDefaultFields: true,
    autocompleteAttribute: "",
    daysToRetainSubmittedRecordsFor: 0,
    daysToRetainApprovedRecordsFor: 0,
    daysToRetainRejectedRecordsFor: 0,
    disableDefaultStylesheet: false,
    cssClass: null,
    submitLabel: "Submit",
    nextLabel: "Next",
    prevLabel: "Previous",
    showPagingOnMultiPageForms: "None",
    pagingDetailsFormat: "Page {0} of {1}",
    pageCaptionFormat: "Page {0}",
    showSummaryPageOnMultiPageForms: false,
    summaryLabel: "Summary of Entry",
  };
}

/**
 * Backfills a partial form design with the defaults above.
 *
 * Only keys the caller actually omitted are filled, so an explicit `null` (a
 * meaningful value for `folderId`, `cssClass` and friends) is preserved.
 */
export function withFormDesignDefaults(
  partial: Record<string, unknown>,
): FormDesign {
  const formId =
    typeof partial.id === "string" && partial.id ? partial.id : randomUUID();
  const defaults = formDesignDefaults(formId);

  const merged: Record<string, unknown> = { ...defaults };
  for (const [key, value] of Object.entries(partial)) {
    if (value !== undefined) merged[key] = value;
  }
  // `unique` mirrors `id` unless the caller set it explicitly.
  if (partial.unique === undefined) merged.unique = merged.id;
  // Fill in the per-node GUIDs, sort orders and field defaults the API
  // requires but the relaxed `pages` schema lets the caller leave out.
  merged.pages = normalizePages(merged.pages, formId);

  return merged as unknown as FormDesign;
}
