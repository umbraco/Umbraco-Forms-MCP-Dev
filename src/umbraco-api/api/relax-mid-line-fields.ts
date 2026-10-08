/**
 * Orval input transformer: makes optional the response properties Umbraco
 * Forms added partway through a major line.
 *
 * The client is generated from the newest Forms release, whose spec marks these
 * properties required. Older releases on the same major don't send them, so a
 * tool whose output schema came from that spec fails validation there — e.g.
 * get-form-by-id on Forms 18.0 (no `memberPrefillMode` on its fields). Dropping
 * them from `required` keeps the tools working across the whole line; the
 * properties themselves, and their types, are untouched.
 *
 * First release with each property, read from the Umbraco Forms models of every
 * 17.x and 18.x release. Only those arriving after 18.0.0 are relaxed on this
 * line; the v17 line relaxes its own column:
 *
 * | Schema.property                               | 17.x   | 18.x   |
 * |-----------------------------------------------|--------|--------|
 * | *TreeItemResponseModel.icon                   | 17.1.0 | 18.0.0 |
 * | FieldTypeWithSettings.isConfigured/-Errors    | 17.1.0 | 18.0.0 |
 * | BasicForm.entries                             | 17.3.0 | 18.0.0 |
 * | DataTypeDetail.propertyEditorUiAlias          | 17.3.0 | 18.0.0 |
 * | Field.memberPrefillMode                       | 17.5.0 | 18.1.0 |
 * | WorkflowTypeWithSettings.isConfigured/-Errors | 17.5.0 | 18.1.0 |
 * | EntrySearchResult.additionalData              | 17.6.0 | 18.2.0 |
 * | EntrySearchResultSchema.isDateField           | 17.6.0 | 18.2.0 |
 * | Folder.trashed, FormDesign.trashed            | 17.6.0 | 18.2.0 |
 */

export const MID_LINE_PROPERTIES: Record<string, string[]> = {
  EntrySearchResult: ["additionalData"],
  EntrySearchResultSchema: ["isDateField"],
  Field: ["memberPrefillMode"],
  Folder: ["trashed"],
  FormDesign: ["trashed"],
  WorkflowTypeWithSettings: ["configurationErrors", "isConfigured"],
};

type Spec = { components?: { schemas?: Record<string, { required?: string[] }> } };

export function relaxMidLineFields<T>(spec: T): T {
  const schemas = (spec as Spec).components?.schemas ?? {};
  for (const [name, properties] of Object.entries(MID_LINE_PROPERTIES)) {
    const schema = schemas[name];
    if (schema?.required) {
      schema.required = schema.required.filter((property) => !properties.includes(property));
    }
  }
  return spec;
}
