import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  SecurityTestHelper,
} from "./setup.js";
import createUserGroupFormSecurityTool from "../post/create-user-group-form-security.js";
import type { FormSecurityForGroup } from "../../../api/generated/umbracoFormsManagementApi.js";

// Doesn't correspond to any real user-group — used only for the error path.
const FAKE_GROUP_ID = "22222222-2222-2222-2222-222222222222";

// Runs against the built-in "Editors" user-group (alias "editor") — not
// "Administrators", the only group the API user running these tests is a
// member of, so mutating Editors can't affect this suite's own credentials.
// Editors already has a Forms security record (a deny-all default Forms
// seems to create for every group on install), so POST here exercises the
// real observed upsert behavior, not a from-empty create. Restored via
// afterEach — see helpers/security-test-helper.ts doc comment.
describe("create-user-group-form-security", () => {
  setupTestEnvironment();

  let groupId: string;
  let originalSnapshot: FormSecurityForGroup | undefined;

  beforeAll(async () => {
    const group = await SecurityTestHelper.findNonAdminUserGroup();
    groupId = group.id;
    originalSnapshot = await SecurityTestHelper.snapshotUserGroupSecurity(groupId);
  });

  afterEach(async () => {
    await SecurityTestHelper.restoreUserGroupSecurity(groupId, originalSnapshot);
  });

  it("should create (upsert) a Forms security record for a real user-group", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createUserGroupFormSecurityTool.handler(
      {
        id: groupId,
        name: originalSnapshot?.name ?? "Editors",
        entityType: originalSnapshot?.entityType ?? null,
        userGroupSecurity: {
          userGroupId: originalSnapshot?.userGroupSecurity.userGroupId ?? 0,
          manageDataSources: originalSnapshot?.userGroupSecurity.manageDataSources ?? false,
          managePreValueSources: originalSnapshot?.userGroupSecurity.managePreValueSources ?? false,
          manageWorkflows: originalSnapshot?.userGroupSecurity.manageWorkflows ?? false,
          manageForms: originalSnapshot?.userGroupSecurity.manageForms ?? false,
          viewEntries: true,
          editEntries: originalSnapshot?.userGroupSecurity.editEntries ?? false,
          deleteEntries: originalSnapshot?.userGroupSecurity.deleteEntries ?? false,
        },
        startFolderIds: originalSnapshot?.startFolderIds ?? [],
        formsSecurity: originalSnapshot?.formsSecurity ?? [],
      },
      context,
    );

    expect(createSnapshotResult(result, groupId)).toMatchSnapshot();
  });

  // The underlying API endpoint doesn't validate the group id itself (it
  // returns 200 for a made-up GUID with nothing persisted) — but the tool
  // now checks the id against the real user-group list first, so it
  // surfaces a proper error instead of a silent no-op success.
  it("should return an error for a non-existent user-group id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createUserGroupFormSecurityTool.handler(
      {
        id: FAKE_GROUP_ID,
        name: "_Test Fake Group",
        entityType: null,
        userGroupSecurity: {
          userGroupId: 999999,
          manageDataSources: false,
          managePreValueSources: false,
          manageWorkflows: false,
          manageForms: false,
          viewEntries: false,
          editEntries: false,
          deleteEntries: false,
        },
        startFolderIds: [],
        formsSecurity: [],
      },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
