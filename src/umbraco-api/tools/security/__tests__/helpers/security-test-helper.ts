/**
 * Security Test Helper
 *
 * This collection manages Forms security/permission RECORDS for existing
 * backoffice users and user-groups — it never creates or deletes the
 * underlying user/user-group. So instead of an entity builder, this helper:
 *
 *  - discovers a real, existing backoffice user and user-group on the
 *    connected instance to run the user/user-group security CRUD tools
 *    against
 *  - snapshots and restores the Forms security record for that user/group so
 *    tests can freely create/update/delete it and always leave the real,
 *    shared instance exactly as they found it
 *
 * Discovery findings on the connected instance (see individual test files for
 * where each is exercised):
 *  - Only one backoffice user exists: the API user itself (`kind: "Api"`)
 *    used to authenticate every integration test in this repo. It already had
 *    a Forms security record before these tests ran (general permissions
 *    configured, no per-form overrides) — so "create" tests exercise the
 *    real observed upsert behavior (POST succeeds and overwrites an existing
 *    record; it does not error on conflict), not a from-empty create.
 *  - getSecurityUserUsersToAssign returns an empty list — the current API
 *    user is excluded from its own "assignable" list, and it's the only user
 *    that exists.
 *  - POST/PUT for user security both 404 for a user id that doesn't
 *    correspond to a real Umbraco user (validated server-side).
 *  - The built-in "Editors" user-group (alias "editor", not "admin" — the API
 *    user is only a member of "Administrators", so Editors is safe to
 *    mutate) already has a Forms security record too (all permissions
 *    false — looks like Forms seeds a deny-all record per group on install).
 *  - `formsSecurity` on the API user's own record lists an access entry for
 *    every form the user currently has access to. Since this repo's other
 *    collections create/delete forms as part of their own tests, that list's
 *    length and contents change while this suite runs — snapshotting it
 *    directly is flaky. `normalizeVolatileFormsSecurity` below collapses it
 *    to a fixed placeholder so snapshots assert shape, not live content.
 *
 * Caveat: restore-in-afterEach only guarantees correctness for a single,
 * uninterrupted run of this suite. If another process concurrently mutates
 * the same real user/group's Forms security record while this suite is
 * running (e.g. another agent invoking `npm test` against the same shared
 * instance at the same time), the two writers can race and the loser's
 * restore can be silently overwritten. This was observed once during
 * development (see get-current-user-form-security's `deleteEntries` flag
 * transiently reading back `true`) and self-corrected on the next clean run.
 */
import {
  UmbracoManagementClient,
  CAPTURE_RAW_HTTP_RESPONSE,
  type HttpResponse,
} from "@umbraco-cms/mcp-server-sdk";
import {
  getUmbracoFormsManagementAPI,
  type FormSecurityForUser,
  type FormSecurityForGroup,
} from "../../../../api/generated/umbracoFormsManagementApi.js";

export interface DiscoveredUserGroup {
  id: string;
  name: string;
  alias: string;
}

interface UserGroupListResponseItem {
  id: string;
  name: string;
  alias: string;
}

interface UserGroupListResponse {
  total: number;
  items: UserGroupListResponseItem[];
}

export class SecurityTestHelper {
  /**
   * Returns the id of the currently authenticated backoffice user (the API
   * user these tests run as) via the Forms Management API's "current user"
   * endpoint. This is the only real, safely-testable user id on most
   * instances — see the class doc comment.
   */
  static async getCurrentUserId(): Promise<string> {
    const client = getUmbracoFormsManagementAPI();
    const response = (await client.getSecurityUserCurrentFormSecurity(
      {},
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as unknown as HttpResponse<{ unique: string }>;
    return response.data.unique;
  }

  /**
   * Finds a real, non-admin user-group on the connected instance via the core
   * Umbraco Management API (not part of the Forms API). Prefers the built-in
   * "Editors" group (alias "editor"); falls back to any group that isn't
   * "Administrators" so tests never touch admin permissions.
   */
  static async findNonAdminUserGroup(): Promise<DiscoveredUserGroup> {
    const response = (await UmbracoManagementClient<UserGroupListResponse>(
      {
        url: "/umbraco/management/api/v1/user-group",
        method: "GET",
        params: { skip: 0, take: 100 },
      },
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as unknown as HttpResponse<UserGroupListResponse>;

    const groups = response.data?.items ?? [];

    if (groups.length === 0) {
      throw new Error(
        "No user-groups available on the connected instance (GET /umbraco/management/api/v1/user-group " +
          "returned an empty list).",
      );
    }

    const editors = groups.find((group) => group.alias === "editor");
    const nonAdmin = groups.find((group) => group.alias !== "admin");
    const found = editors ?? nonAdmin;

    if (!found) {
      throw new Error(
        "Every user-group on the connected instance is the built-in 'Administrators' group — no " +
          "non-admin group is available to safely test user-group Forms security against.",
      );
    }

    return found;
  }

  /**
   * Fetches the current Forms security record for a user, or `undefined` if
   * the user has no record yet (404). Used to snapshot state before a test
   * mutates it, so it can be restored afterward.
   */
  static async snapshotUserSecurity(userId: string): Promise<FormSecurityForUser | undefined> {
    const client = getUmbracoFormsManagementAPI();
    const response = (await client.getSecurityUserByIdFormSecurity(
      userId,
      {},
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as unknown as HttpResponse<FormSecurityForUser>;

    if (response.status === 404) return undefined;
    return response.data;
  }

  /**
   * Fetches the current Forms security record for a user-group, or
   * `undefined` if the group has no record yet (404).
   */
  static async snapshotUserGroupSecurity(
    userGroupId: string,
  ): Promise<FormSecurityForGroup | undefined> {
    const client = getUmbracoFormsManagementAPI();
    const response = (await client.getSecurityUserGroupByIdFormSecurity(
      userGroupId,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as unknown as HttpResponse<FormSecurityForGroup>;

    if (response.status === 404) return undefined;
    return response.data;
  }

  /**
   * Restores a user's Forms security record to a previously captured
   * snapshot — POSTs the snapshot back if one existed, or deletes the record
   * if the user had none before the test ran. Swallows errors: this runs in
   * `afterEach` and must never fail the test itself.
   */
  static async restoreUserSecurity(
    userId: string,
    snapshot: FormSecurityForUser | undefined,
  ): Promise<void> {
    const client = getUmbracoFormsManagementAPI();
    try {
      if (snapshot) {
        await client.postSecurityUserByIdFormSecurity(userId, snapshot, CAPTURE_RAW_HTTP_RESPONSE);
      } else {
        await client.deleteSecurityUserByIdFormSecurity(userId, CAPTURE_RAW_HTTP_RESPONSE);
      }
    } catch {
      // Best-effort cleanup — never fail a test's afterEach on this.
    }
  }

  /**
   * Restores a user-group's Forms security record to a previously captured
   * snapshot, mirroring {@link restoreUserSecurity}.
   */
  static async restoreUserGroupSecurity(
    userGroupId: string,
    snapshot: FormSecurityForGroup | undefined,
  ): Promise<void> {
    const client = getUmbracoFormsManagementAPI();
    try {
      if (snapshot) {
        await client.postSecurityUserGroupByIdFormSecurity(
          userGroupId,
          snapshot,
          CAPTURE_RAW_HTTP_RESPONSE,
        );
      } else {
        await client.deleteSecurityUserGroupByIdFormSecurity(userGroupId, CAPTURE_RAW_HTTP_RESPONSE);
      }
    } catch {
      // Best-effort cleanup — never fail a test's afterEach on this.
    }
  }

  /**
   * Collapses a security record's `formsSecurity` array to a fixed
   * placeholder before snapshotting. On the shared instance this list's
   * length/contents change as other collections' tests create and delete
   * forms concurrently — see the class doc comment. Leaves everything else
   * untouched so the rest of the record (permission flags, name, ids) still
   * gets a meaningful snapshot.
   */
  static normalizeVolatileFormsSecurity(data: unknown): unknown {
    if (data && typeof data === "object") {
      const normalized: Record<string, unknown> = { ...(data as Record<string, unknown>) };
      if (Array.isArray(normalized.formsSecurity)) {
        normalized.formsSecurity = "NORMALIZED_FORMS_SECURITY_LIST";
      }
      return normalized;
    }
    return data;
  }
}
