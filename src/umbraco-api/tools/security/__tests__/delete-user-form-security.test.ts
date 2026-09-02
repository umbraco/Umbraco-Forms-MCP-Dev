import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  SecurityTestHelper,
} from "./setup.js";
import deleteUserFormSecurityTool from "../delete/delete-user-form-security.js";
import type { FormSecurityForUser } from "../../../api/generated/umbracoFormsManagementApi.js";

// Doesn't correspond to any real backoffice user — used only for the error path.
const FAKE_USER_ID = "11111111-1111-1111-1111-111111111111";

// This deletes the real, only backoffice user's Forms security record for the
// duration of a single test, then immediately restores the exact pre-test
// snapshot in afterEach — see create-user-form-security.test.ts. Tests run
// serially (--runInBand) and this repo's other collections don't call any
// Forms endpoint that depends on this user's Forms security mid-test, so the
// restore window never overlaps another test's execution.
describe("delete-user-form-security", () => {
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

  it("should delete the Forms security record for a real backoffice user", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteUserFormSecurityTool.handler({ id: userId }, context);

    expect(createSnapshotResult(result, userId)).toMatchSnapshot();
  });

  it("should return an error for a user id that doesn't exist", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteUserFormSecurityTool.handler({ id: FAKE_USER_ID }, context);

    expect(result.isError).toBe(true);
  });
});
