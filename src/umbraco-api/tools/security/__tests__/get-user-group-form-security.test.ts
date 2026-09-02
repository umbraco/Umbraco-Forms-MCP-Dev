import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  SecurityTestHelper,
} from "./setup.js";
import getUserGroupFormSecurityTool from "../get/get-user-group-form-security.js";

describe("get-user-group-form-security", () => {
  setupTestEnvironment();

  it("should return the Forms security configuration for a real user-group", async () => {
    const context = createMockRequestHandlerExtra();
    const group = await SecurityTestHelper.findNonAdminUserGroup();

    const result = await getUserGroupFormSecurityTool.handler({ id: group.id }, context);

    // formsSecurity's length/contents vary as other collections' tests
    // create/delete forms concurrently on the shared instance — normalize it.
    const normalized = {
      ...result,
      structuredContent: SecurityTestHelper.normalizeVolatileFormsSecurity(result.structuredContent),
    };
    expect(createSnapshotResult(normalized, group.id)).toMatchSnapshot();
  });

  it("should return an error for a user-group with no Forms security record", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getUserGroupFormSecurityTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
