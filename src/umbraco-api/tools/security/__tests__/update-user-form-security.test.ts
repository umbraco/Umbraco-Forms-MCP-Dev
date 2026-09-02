import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  SecurityTestHelper,
} from "./setup.js";
import updateUserFormSecurityTool from "../put/update-user-form-security.js";
import type { FormSecurityForUser } from "../../../api/generated/umbracoFormsManagementApi.js";

// Doesn't correspond to any real backoffice user — used only for the error path.
const FAKE_USER_ID = "11111111-1111-1111-1111-111111111111";

// See create-user-form-security.test.ts for why this operates on the real,
// only backoffice user on the connected instance, and why every mutation is
// restored (never reduced) via afterEach.
describe("update-user-form-security", () => {
  setupTestEnvironment();

  let userId: string;
  let originalSnapshot: FormSecurityForUser | undefined;

  beforeAll(async () => {
    userId = await SecurityTestHelper.getCurrentUserId();
    originalSnapshot = await SecurityTestHelper.snapshotUserSecurity(userId);
  });

  afterEach(async () => {
    await SecurityTestHelper.restoreUserSecurity(userId, originalSnapshot);
  });

  it("should replace the Forms security configuration for a real backoffice user", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await updateUserFormSecurityTool.handler(
      {
        id: userId,
        name: originalSnapshot?.name ?? "MCP API User",
        entityType: originalSnapshot?.entityType ?? null,
        userSecurity: {
          user: originalSnapshot?.userSecurity.user ?? "1",
          manageDataSources: originalSnapshot?.userSecurity.manageDataSources ?? true,
          managePreValueSources: originalSnapshot?.userSecurity.managePreValueSources ?? true,
          manageWorkflows: originalSnapshot?.userSecurity.manageWorkflows ?? true,
          manageForms: originalSnapshot?.userSecurity.manageForms ?? true,
          viewEntries: originalSnapshot?.userSecurity.viewEntries ?? true,
          editEntries: originalSnapshot?.userSecurity.editEntries ?? true,
          deleteEntries: true,
        },
        startFolderIds: originalSnapshot?.startFolderIds ?? [],
        formsSecurity: originalSnapshot?.formsSecurity ?? [],
      },
      context,
    );

    expect(createSnapshotResult(result, userId)).toMatchSnapshot();
  });

  it("should return an error for a user id that doesn't exist", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await updateUserFormSecurityTool.handler(
      {
        id: FAKE_USER_ID,
        name: "_Test Fake User",
        entityType: null,
        userSecurity: {
          user: "999999",
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
