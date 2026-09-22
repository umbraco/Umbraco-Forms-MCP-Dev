/**
 * Add Form Fields Tool
 *
 * The counterpart to `delete-form-field`: adds one or more fields to an
 * existing form without making the caller reproduce the whole design.
 *
 * Umbraco Forms has no field-level create endpoint — the only write is a full
 * PUT of the form — so this fetches the current design, appends the new fields
 * server-side, and writes the rest back untouched. Fields are described in the
 * same compact shape `create-simple-form` accepts.
 */

import {
  executeVoidApiCall,
  getApiClient,
  UmbracoApiError,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
  type HttpResponse,
  type ProblemDetails,
} from "@umbraco-cms/mcp-server-sdk";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type {
  getUmbracoFormsManagementAPI,
  FormDesign,
} from "../../../api/generated/umbracoFormsManagementApi.js";
import { withBodyDecorators } from "../../shared/body-text.js";
import {
  buildField,
  simpleFieldSchema,
  type SimpleFieldSpec,
} from "../shared/build-form-design.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

/** Loose structural views of the parts of a design this tool rewrites. */
type FieldNode = { alias?: string | null };
type ContainerNode = { id: string; caption: string | null; width: number; fields: FieldNode[] };
type FieldSetNode = {
  id: string;
  caption: string | null;
  sortOrder: number;
  page: string;
  condition: unknown;
  containers: ContainerNode[];
};
type PageNode = { id: string; fieldSets: FieldSetNode[] };

const inputSchema = {
  formId: z
    .uuid()
    .describe("The id of the form to add fields to. Use list-forms or search-forms to find it."),
  fields: z
    .array(simpleFieldSchema)
    .min(1)
    .describe(
      "Fields to append, in the same compact shape create-simple-form accepts. A field's optional 'group' targets the fieldset with that caption, which is created if it does not exist.",
    ),
  pageIndex: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("Zero-based page to add the fields to. Defaults to the last page."),
};

const AddFormFieldsTool = {
  name: "add-form-fields",
  description:
    "Adds one or more fields to an existing form without needing the full form design as input. Fetches the current design, appends the fields, and saves the rest of the form unchanged. Prefer this over update-form whenever you are only adding fields — it avoids reproducing the entire form object. Each field takes a label and a type, plus optionally required, group, placeholder, helpText, options, pattern and maxLength. A field's 'group' targets the fieldset with that caption, creating it if absent; fields without a group are appended to the last fieldset. Aliases are generated so they do not collide with fields already on the form.",
  inputSchema,
  slices: ["update"],
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
  },
  handler: async ({ formId, fields, pageIndex }) => {
    const client = getApiClient<ApiClient>();

    const existingResponse = (await client.getFormById(
      formId,
      undefined,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<FormDesign | ProblemDetails>;

    if (existingResponse.status < 200 || existingResponse.status >= 300) {
      throw new UmbracoApiError(existingResponse.data as ProblemDetails);
    }

    const existing = existingResponse.data as FormDesign;
    const pages = structuredClone(existing.pages) as unknown as PageNode[];

    if (pages.length === 0) {
      throw new UmbracoApiError({
        status: 400,
        title: "Form has no pages",
        detail: `Form "${formId}" has no pages to add fields to. Use update-form to add a page first.`,
      });
    }

    const targetIndex = pageIndex ?? pages.length - 1;
    const page = pages[targetIndex];
    if (!page) {
      throw new UmbracoApiError({
        status: 400,
        title: "Page not found",
        detail: `Form "${formId}" has ${pages.length} page(s); pageIndex ${targetIndex} is out of range.`,
      });
    }

    // Reserve every alias already on the form so generated ones never collide.
    const takenAliases = new Set<string>();
    for (const existingPage of pages) {
      for (const fieldSet of existingPage.fieldSets) {
        for (const container of fieldSet.containers) {
          for (const field of container.fields) {
            if (field.alias) takenAliases.add(field.alias);
          }
        }
      }
    }

    /** Finds the fieldset for a group caption, creating it when absent. */
    const resolveFieldSet = (group: string | undefined): FieldSetNode => {
      if (group) {
        const match = page.fieldSets.find((fieldSet) => fieldSet.caption === group);
        if (match) return match;
      } else {
        const last = page.fieldSets[page.fieldSets.length - 1];
        if (last) return last;
      }

      const created: FieldSetNode = {
        id: randomUUID(),
        caption: group ?? null,
        sortOrder: page.fieldSets.length,
        page: page.id,
        condition: null,
        containers: [],
      };
      page.fieldSets.push(created);
      return created;
    };

    for (const spec of fields as SimpleFieldSpec[]) {
      const fieldSet = resolveFieldSet(spec.group);

      let container = fieldSet.containers[0];
      if (!container) {
        container = { id: randomUUID(), caption: null, width: 12, fields: [] };
        fieldSet.containers.push(container);
      }

      container.fields.push(buildField(spec, takenAliases) as FieldNode);
    }

    const payload = { ...existing, pages } as unknown as FormDesign;

    return executeVoidApiCall<ApiClient>((apiClient) =>
      apiClient.putFormById(formId, payload, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<typeof inputSchema>;

export default withBodyDecorators(AddFormFieldsTool);
