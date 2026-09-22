/**
 * A relaxed schema for a form's `pages` tree, plus the normalizer that turns it
 * back into what the API requires.
 *
 * ## Why not the generated schema
 *
 * Orval marks nearly every property of every node as required, because the
 * Forms spec does. Relaxing only the *top level* of a form design is not
 * enough: the four-level `pages -> fieldSets -> containers -> fields` nesting
 * repeats the same problem on every node, so adding a single text field still
 * meant supplying `id`, `sortOrder`, `page`, `prevalueSourceId`,
 * `allowMultipleFileUploads`, `memberPrefillMode` and a dozen more — none of
 * which is a decision anyone makes.
 *
 * Here each node asks only for what actually varies (a field's `caption` and
 * `fieldTypeId`) and `normalizePages` fills in the rest before the call.
 *
 * ## Forward compatibility
 *
 * Every node is a *loose* object, so any property this file does not enumerate
 * — including ones a future Umbraco version adds — is passed through to the API
 * untouched rather than stripped. The enumerated properties exist to document
 * and type the common ones, not to constrain the payload.
 */

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";

const preValueSchema = z.looseObject({
  value: z.string().describe("Value stored in the submission."),
  caption: z.string().describe("Label shown to the user."),
});

const fieldSchema = z.looseObject({
  caption: z.string().describe("The field's label, e.g. 'Email address'."),
  fieldTypeId: z
    .string()
    .describe("Field type GUID. Use list-field-types to look one up."),
  id: z.string().optional().describe("Field GUID. Generated when omitted."),
  alias: z.string().optional().describe("Field alias. Derived from the caption when omitted."),
  mandatory: z.boolean().optional().describe("Whether the field is required. Default false."),
  tooltip: z.string().nullable().optional().describe("Help text shown with the field."),
  regex: z
    .string()
    .nullable()
    .optional()
    .describe("Regular expression the value must match."),
  requiredErrorMessage: z.string().nullable().optional(),
  invalidErrorMessage: z.string().nullable().optional(),
  containsSensitiveData: z.boolean().optional().describe("Default false."),
  settings: z
    .record(z.string(), z.string())
    .optional()
    .describe("Field-type settings, e.g. { FieldType: 'email', Placeholder: '...' }."),
  preValues: z
    .array(preValueSchema)
    .optional()
    .describe("Options for dropdown / radio / checkbox-list field types."),
  condition: z
    .any()
    .optional()
    .describe("Conditional show/hide rule for this field."),
});

const containerSchema = z.looseObject({
  fields: z.array(fieldSchema).describe("Fields in this container."),
  id: z.string().optional().describe("Container GUID. Generated when omitted."),
  caption: z.string().nullable().optional(),
  width: z.number().int().optional().describe("Bootstrap-style column width. Default 12."),
});

const fieldSetSchema = z.looseObject({
  containers: z
    .array(containerSchema)
    .optional()
    .describe("Columns within the fieldset. Omit for a single full-width container."),
  fields: z
    .array(fieldSchema)
    .optional()
    .describe("Shorthand for a single full-width container holding these fields."),
  id: z.string().optional().describe("Fieldset GUID. Generated when omitted."),
  caption: z.string().nullable().optional().describe("Fieldset heading."),
  sortOrder: z.number().int().optional().describe("Defaults to the array position."),
  condition: z.any().optional(),
});

const pageSchema = z.looseObject({
  fieldSets: z.array(fieldSetSchema).describe("Fieldsets (groups) on this page."),
  id: z.string().optional().describe("Page GUID. Generated when omitted."),
  caption: z.string().nullable().optional().describe("Page heading."),
  sortOrder: z.number().int().optional().describe("Defaults to the array position."),
  condition: z.any().optional(),
  buttonCondition: z.any().optional(),
});

/** Relaxed replacement for the generated `pages` property. */
export const relaxedPagesSchema = z
  .array(pageSchema)
  .describe(
    "The form's pages. Only each field's caption and fieldTypeId are required — GUIDs, sort orders and per-field defaults are generated when omitted.",
  );

type LooseNode = Record<string, unknown>;

/** Derives a camelCase alias from a caption, unique within the form. */
function deriveAlias(caption: string, taken: Set<string>): string {
  const words = caption
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

  if (/^\d/.test(base)) base = `field${base}`;

  let candidate = base;
  let suffix = 2;
  while (taken.has(candidate)) candidate = `${base}${suffix++}`;
  taken.add(candidate);
  return candidate;
}

/** Applies a default only when the caller omitted the key entirely. */
function withDefaults(node: LooseNode, defaults: LooseNode): LooseNode {
  const out: LooseNode = { ...defaults };
  for (const [key, value] of Object.entries(node)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

/**
 * Fills in every property the API requires but the relaxed schema leaves
 * optional: node GUIDs, sort orders, parent references and per-field defaults.
 *
 * An explicitly supplied value always wins, including an explicit `null`.
 */
export function normalizePages(
  pages: unknown,
  formId: string,
): Record<string, unknown>[] {
  if (!Array.isArray(pages)) return [];

  const takenAliases = new Set<string>();

  // Reserve caller-supplied aliases first so generated ones never collide with
  // them, regardless of the order fields appear in.
  for (const page of pages as LooseNode[]) {
    for (const fieldSet of (page.fieldSets as LooseNode[]) ?? []) {
      const containers =
        (fieldSet.containers as LooseNode[]) ??
        (fieldSet.fields ? [{ fields: fieldSet.fields }] : []);
      for (const container of containers) {
        for (const field of (container.fields as LooseNode[]) ?? []) {
          if (typeof field.alias === "string" && field.alias) {
            takenAliases.add(field.alias);
          }
        }
      }
    }
  }

  return (pages as LooseNode[]).map((page, pageIndex) => {
    const pageId = (page.id as string) ?? randomUUID();

    const fieldSets = ((page.fieldSets as LooseNode[]) ?? []).map(
      (fieldSet, fieldSetIndex) => {
        // `fields` directly on a fieldset is shorthand for one full-width
        // container; it is the shape people reach for first.
        const rawContainers =
          (fieldSet.containers as LooseNode[]) ??
          (fieldSet.fields ? [{ fields: fieldSet.fields }] : []);

        const containers = rawContainers.map((container) =>
          withDefaults(container, {
            id: randomUUID(),
            caption: null,
            width: 12,
            fields: [],
          }),
        );

        for (const container of containers) {
          container.fields = ((container.fields as LooseNode[]) ?? []).map(
            (field) =>
              withDefaults(field, {
                id: randomUUID(),
                // Only derive when the caller left `alias` out; deriving
                // unconditionally would reserve a name the caller's own alias
                // then replaces, pushing later fields onto a needless suffix.
                alias:
                  typeof field.alias === "string" && field.alias
                    ? field.alias
                    : deriveAlias(String(field.caption ?? "field"), takenAliases),
                caption: "",
                fieldTypeId: "",
                tooltip: null,
                cssClass: null,
                mandatory: false,
                containsSensitiveData: false,
                regex: null,
                requiredErrorMessage: null,
                invalidErrorMessage: null,
                condition: null,
                prevalueSourceId: BLANK_UUID,
                dataSourceFieldKey: null,
                settings: {},
                preValues: [],
                allowedUploadTypes: null,
                allowMultipleFileUploads: false,
                mappedMemberPropertyAlias: null,
                memberPrefillMode: "None",
              }),
          );
        }

        const normalized = withDefaults(fieldSet, {
          id: randomUUID(),
          caption: null,
          sortOrder: fieldSetIndex,
          condition: null,
        });
        // `page` is a back-reference the API requires; always the owning page.
        normalized.page = pageId;
        normalized.containers = containers;
        // `fields` was shorthand only — it is not part of the wire shape.
        delete normalized.fields;
        return normalized;
      },
    );

    const normalizedPage = withDefaults(page, {
      id: pageId,
      caption: null,
      sortOrder: pageIndex,
      condition: null,
      buttonCondition: null,
    });
    normalizedPage.id = pageId;
    normalizedPage.form = formId;
    normalizedPage.fieldSets = fieldSets;
    return normalizedPage;
  });
}
