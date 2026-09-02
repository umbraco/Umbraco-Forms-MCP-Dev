import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  SecurityTestHelper,
} from "./setup.js";
import deleteUserGroupFormSecurityTool from "../delete/delete-user-group-form-security.js";
import type { FormSecurityForGroup } from "../../../api/generated/umbracoFormsManagementApi.js";

// Doesn't correspond to any real user-group — used only for the error path.
const FAKE_GROUP_ID = "44444444-4444-4444-4444-444444444444";

// See create-user-group-form-security.test.ts for why this runs against the
// real "Editors" group, and why it's restored in afterEach. Unlike the user
// endpoints, delete-of-nonexistent for groups does 404 (verified directly),
// so this one does get a genuine error-path test.
describe("delete-user-group-form-security", () => {
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

  it("should delete the Forms security record for a real user-group", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteUserGroupFormSecurityTool.handler({ id: groupId }, context);

    expect(createSnapshotResult(result, groupId)).toMatchSnapshot();
  });

  it("should return an error for a record that doesn't exist", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteUserGroupFormSecurityTool.handler({ id: FAKE_GROUP_ID }, context);

    expect(result.isError).toBe(true);
  });
});
