import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  SecurityTestHelper,
} from "./setup.js";
import getUserFormSecurityTool from "../get/get-user-form-security.js";

describe("get-user-form-security", () => {
  setupTestEnvironment();

  it("should return the Forms security configuration for a real backoffice user", async () => {
    const context = createMockRequestHandlerExtra();
    const userId = await SecurityTestHelper.getCurrentUserId();

    const result = await getUserFormSecurityTool.handler({ id: userId, explicitOnly: false }, context);

    // formsSecurity's length/contents vary as other collections' tests
    // create/delete forms concurrently on the shared instance — normalize it.
    const normalized = {
      ...result,
      structuredContent: SecurityTestHelper.normalizeVolatileFormsSecurity(result.structuredContent),
    };
    expect(createSnapshotResult(normalized, userId)).toMatchSnapshot();
  });

  it("should return an error for a user with no Forms security record", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getUserFormSecurityTool.handler(
      { id: "00000000-0000-0000-0000-000000000000", explicitOnly: false },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
