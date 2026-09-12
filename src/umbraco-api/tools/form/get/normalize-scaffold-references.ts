/**
 * Backfills the parent-reference fields on a scaffolded (never-persisted)
 * FormDesign that Umbraco Forms' scaffold generation leaves at the all-zero
 * default GUID instead of the newly generated id they should point at:
 * each page's `form` (-> FormDesign.id) and each fieldset's `page` (-> Page.id).
 *
 * Same root cause as normalize-scaffold-dates.ts: the scaffold endpoints build
 * a brand-new FormDesign bottom-up without threading the freshly generated
 * parent ids back down into these foreign-key fields. Passing the scaffold
 * straight to create-form with these still zeroed would submit a form whose
 * own pages/fieldsets don't reference it or their containing page.
 */
import type { HttpResponse } from "@umbraco-cms/mcp-server-sdk";

interface ScaffoldPage {
  id?: unknown;
  form?: unknown;
  fieldSets?: Array<{ page?: unknown; [key: string]: unknown }>;
  [key: string]: unknown;
}

interface ScaffoldDesign {
  id?: unknown;
  pages?: ScaffoldPage[];
  [key: string]: unknown;
}

export function normalizeScaffoldReferences<T>(
  response: HttpResponse<T>,
): HttpResponse<T> {
  const data = response.data as ScaffoldDesign | null | undefined;

  if (
    response.status < 200 ||
    response.status >= 300 ||
    !data ||
    typeof data !== "object" ||
    typeof data.id !== "string" ||
    !Array.isArray(data.pages)
  ) {
    return response;
  }

  const formId = data.id;

  return {
    ...response,
    data: {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        form: formId,
        fieldSets: Array.isArray(page.fieldSets)
          ? page.fieldSets.map((fieldSet) => ({
              ...fieldSet,
              page: page.id,
            }))
          : page.fieldSets,
      })),
    } as T,
  };
}
