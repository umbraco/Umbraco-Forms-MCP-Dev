import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  SecurityTestHelper,
} from "./setup.js";
import updateUserGroupFormSecurityTool from "../put/update-user-group-form-security.js";
import type { FormSecurityForGroup } from "../../../api/generated/umbracoFormsManagementApi.js";

// See create-user-group-form-security.test.ts for why this runs against the
// real "Editors" group, and why it's restored (not reduced) in afterEach.
describe("update-user-group-form-security", () => {
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

  it("should replace the Forms security configuration for a real user-group", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await updateUserGroupFormSecurityTool.handler(
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
    const fakeGroupId = "33333333-3333-3333-3333-333333333333";

    const result = await updateUserGroupFormSecurityTool.handler(
      {
        id: fakeGroupId,
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
