import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import listUsersToAssignTool from "../get/list-users-to-assign.js";

// NOTE: the connected instance has exactly one backoffice user — the API user
// these integration tests authenticate as — and this endpoint excludes the
// current user from its own "assignable" list. So the real, observed result
// here is an empty list rather than a populated one (verified directly
// against the live endpoint; see helpers/security-test-helper.ts doc
// comment). This documents that real behavior instead of asserting on data
// that doesn't exist on this instance.
describe("list-users-to-assign", () => {
  setupTestEnvironment();

  it("should list backoffice users assignable to Forms security", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listUsersToAssignTool.handler({}, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
