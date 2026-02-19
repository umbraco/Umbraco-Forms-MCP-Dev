import type { UserSecurity } from "../umbraco-api/api/generated/umbracoFormsManagementApi.js";

/**
 * User context for Forms-specific permission checks.
 *
 * The `security` field comes from `getSecurityUserCurrentFormSecurity()`.
 * When undefined, it means the user has no Forms access at all
 * (either the API call failed or the user lacks the Forms section).
 */
export interface FormsUserContext {
  security?: UserSecurity;
}

/**
 * Authorization policies for Umbraco Forms permissions.
 *
 * These check the granular boolean permissions returned by the
 * Forms security API (`/security/user/current/form-security`).
 */
export const FormsAuthorizationPolicies = {
  /** User has any Forms access (security was successfully fetched) */
  HasFormsAccess: (user: FormsUserContext) => user.security !== undefined,

  /** User can create, copy, update, move, and delete forms and folders */
  ManageForms: (user: FormsUserContext) => user.security?.manageForms === true,

  /** User can view form submission records */
  ViewEntries: (user: FormsUserContext) => user.security?.viewEntries === true,

  /** User can edit form submission records */
  EditEntries: (user: FormsUserContext) => user.security?.editEntries === true,

  /** User can delete form submission records */
  DeleteEntries: (user: FormsUserContext) => user.security?.deleteEntries === true,

  /** User can copy workflows and retry record workflows */
  ManageWorkflows: (user: FormsUserContext) => user.security?.manageWorkflows === true,

  /** User can create, update, and delete data sources */
  ManageDataSources: (user: FormsUserContext) => user.security?.manageDataSources === true,

  /** User can create, update, and delete prevalue sources */
  ManagePreValueSources: (user: FormsUserContext) => user.security?.managePreValueSources === true,
};
