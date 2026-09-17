/**
 * Built-in Umbraco Forms field types, and the friendly aliases `create-simple-form`
 * accepts in their place.
 *
 * These GUIDs are the IDs of the field types Umbraco Forms ships with; they are
 * fixed constants in the Forms source, not per-installation values, so they are
 * safe to hard-code. Anything a site has added on top of them is *not* here —
 * for those, call `list-field-types` and use `create-form` with the explicit
 * `fieldTypeId`.
 *
 * Several friendly aliases map onto the same underlying field type and differ
 * only by the `FieldType` setting, which drives the HTML5 input type: `email`,
 * `phone`, `number` and `url` are all "Short answer" with a different
 * `FieldType`. That mirrors how an editor would configure them in the
 * backoffice.
 */

/** Field type IDs shipped with Umbraco Forms. */
export const FORMS_FIELD_TYPE_IDS = {
  shortAnswer: "3f92e01b-29e2-4a30-bf33-9df5580ed52c",
  longAnswer: "023f09ac-1445-4bcb-b8fa-ab49f33bd046",
  date: "f8b4c3b8-af28-11de-9dd8-ef5956d89593",
  checkbox: "d5c0c390-ae9a-11de-a69e-666455d89593",
  fileUpload: "84a17cf8-b711-46a6-9840-0e4a072ad000",
  password: "fb37bc60-d41e-11de-aeae-37c155d89593",
  multipleChoice: "fab43f20-a6bf-11de-a28f-9b5755d89593",
  dataConsent: "a72c9df9-3847-47cf-afb8-b86773fd12cd",
  dropdown: "0dd29d42-a6a5-11de-a2f2-222256d89593",
  singleChoice: "903df9b0-a78c-11de-9fc1-db7a56d89593",
  titleAndDescription: "e3fbf6c4-f46c-495e-aff8-4b3c227b4a98",
  richText: "1f8d45f8-76e6-4550-a0f5-9637b8454619",
  hidden: "da206cae-1c52-434e-b21a-4a7c198af877",
  recaptcha2: "b69deaeb-ed75-4dc9-bfb8-d036bf9d3730",
  recaptcha3: "663aa19b-423d-4f38-a1d6-c840c926ef86",
  recaptchaEnterprise: "1bab78cb-52b1-495c-bbc2-a46540642828",
} as const;

/** What a friendly alias expands to. */
interface FieldTypeMapping {
  /** Underlying Umbraco Forms field type ID. */
  fieldTypeId: string;
  /** Settings implied by the alias, merged under any caller-supplied settings. */
  settings?: Record<string, string>;
  /** True when the field type renders a list the caller can supply `options` for. */
  supportsOptions?: boolean;
  /** True for display-only fields that never capture a value. */
  displayOnly?: boolean;
  /** Default `autocomplete` attribute, when the alias implies one. */
  autocomplete?: string;
}

/**
 * Friendly alias -> field type. The key is what a caller passes as `type`.
 */
export const FIELD_TYPE_ALIASES: Record<string, FieldTypeMapping> = {
  text: { fieldTypeId: FORMS_FIELD_TYPE_IDS.shortAnswer, settings: { FieldType: "text" } },
  textarea: { fieldTypeId: FORMS_FIELD_TYPE_IDS.longAnswer },
  email: {
    fieldTypeId: FORMS_FIELD_TYPE_IDS.shortAnswer,
    settings: { FieldType: "email" },
    autocomplete: "email",
  },
  phone: {
    fieldTypeId: FORMS_FIELD_TYPE_IDS.shortAnswer,
    settings: { FieldType: "tel" },
    autocomplete: "tel",
  },
  number: { fieldTypeId: FORMS_FIELD_TYPE_IDS.shortAnswer, settings: { FieldType: "number" } },
  url: { fieldTypeId: FORMS_FIELD_TYPE_IDS.shortAnswer, settings: { FieldType: "url" } },
  date: { fieldTypeId: FORMS_FIELD_TYPE_IDS.date },
  time: { fieldTypeId: FORMS_FIELD_TYPE_IDS.shortAnswer, settings: { FieldType: "time" } },
  password: { fieldTypeId: FORMS_FIELD_TYPE_IDS.password },
  checkbox: { fieldTypeId: FORMS_FIELD_TYPE_IDS.checkbox },
  dropdown: { fieldTypeId: FORMS_FIELD_TYPE_IDS.dropdown, supportsOptions: true },
  radio: { fieldTypeId: FORMS_FIELD_TYPE_IDS.singleChoice, supportsOptions: true },
  checkboxList: { fieldTypeId: FORMS_FIELD_TYPE_IDS.multipleChoice, supportsOptions: true },
  fileUpload: { fieldTypeId: FORMS_FIELD_TYPE_IDS.fileUpload },
  hidden: { fieldTypeId: FORMS_FIELD_TYPE_IDS.hidden },
  consent: { fieldTypeId: FORMS_FIELD_TYPE_IDS.dataConsent },
  title: { fieldTypeId: FORMS_FIELD_TYPE_IDS.titleAndDescription, displayOnly: true },
  richText: { fieldTypeId: FORMS_FIELD_TYPE_IDS.richText, displayOnly: true },
  recaptcha: { fieldTypeId: FORMS_FIELD_TYPE_IDS.recaptcha3, displayOnly: true },
};

/** Alias names, for the tool's Zod enum and its error messages. */
export const FIELD_TYPE_ALIAS_NAMES = Object.keys(FIELD_TYPE_ALIASES) as [
  string,
  ...string[],
];
