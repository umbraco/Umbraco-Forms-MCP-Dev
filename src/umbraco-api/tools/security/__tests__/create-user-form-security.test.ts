import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  SecurityTestHelper,
} from "./setup.js";
import createUserFormSecurityTool from "../post/create-user-form-security.js";
import type { FormSecurityForUser } from "../../../api/generated/umbracoFormsManagementApi.js";

// Doesn't correspond to any real backoffice user on the connected instance —
// used only to exercise the error path (the API validates the id server-side).
const FAKE_USER_ID = "11111111-1111-1111-1111-111111111111";

// The only real backoffice user on the connected instance is the API user
// these integration tests authenticate as, and it already has a Forms
// security record — so the observed real behavior of POST here is an
// idempotent upsert (200/201, overwrites), not a "conflict" error. Every
// mutation is restored to its pre-test snapshot in afterEach, and never
// reduces a permission the running tests themselves rely on (only
// `deleteEntries`, which nothing here exercises, is flipped).
describe("create-user-form-security", () => {
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

  it("should create (upsert) a Forms security record for a real backoffice user", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createUserFormSecurityTool.handler(
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

    const result = await createUserFormSecurityTool.handler(
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
