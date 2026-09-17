/**
 * `FormDesign` properties the Forms spec marks as required but which the caller
 * should not have to supply.
 *
 * Each one is a constant (`entityType`, `indicator`, `pagingDetailsFormat`), a
 * value the server owns (`path`, `created`, `updated`, `nodeId`), an identifier
 * that only has to be unique (`id`, `unique`), or a display default with an
 * obvious sensible value (`submitLabel`, `showValidationSummary`).
 *
 * `name` and `pages` are deliberately absent: they are the two things a form
 * actually needs a human to decide, so they stay required.
 *
 * Shared by `create-form` and `update-form` so the two tools relax and backfill
 * exactly the same set.
 */
export const SERVER_DERIVABLE_FORM_KEYS = [
  "formWorkflows",
  "path",
  "created",
  "updated",
  "validationRules",
  "id",
  "unique",
  "entityType",
  "fieldIndicationType",
  "indicator",
  "showValidationSummary",
  "hideFieldValidation",
  "requiredErrorMessage",
  "invalidErrorMessage",
  "messageOnSubmitIsHtml",
  "manualApproval",
  "storeRecordsLocally",
  "displayDefaultFields",
  "selectedDisplayFields",
  "daysToRetainSubmittedRecordsFor",
  "daysToRetainApprovedRecordsFor",
  "daysToRetainRejectedRecordsFor",
  "disableDefaultStylesheet",
  "nodeId",
  "showPagingOnMultiPageForms",
  "pagingDetailsFormat",
  "pageCaptionFormat",
  "showSummaryPageOnMultiPageForms",
] as const;
