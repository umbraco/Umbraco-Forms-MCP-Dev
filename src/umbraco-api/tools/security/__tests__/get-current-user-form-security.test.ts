import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  SecurityTestHelper,
} from "./setup.js";
import getCurrentUserFormSecurityTool from "../get/get-current-user-form-security.js";

// No dependencies — this always resolves to the currently authenticated
// (API) user's own Forms security record, which already exists on every
// connected instance (see helpers/security-test-helper.ts doc comment).
describe("get-current-user-form-security", () => {
  setupTestEnvironment();

  it("should return the current user's Forms security configuration", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getCurrentUserFormSecurityTool.handler(
      { includeFormFieldDetails: false },
      context,
    );

    // formsSecurity's length/contents vary as other collections' tests
    // create/delete forms concurrently on the shared instance — normalize it.
    const normalized = {
      ...result,
      structuredContent: SecurityTestHelper.normalizeVolatileFormsSecurity(result.structuredContent),
    };
    expect(createSnapshotResult(normalized)).toMatchSnapshot();
  });

  it("should include field details when includeFormFieldDetails is true", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getCurrentUserFormSecurityTool.handler(
      { includeFormFieldDetails: true },
      context,
    );

    const normalized = {
      ...result,
      structuredContent: SecurityTestHelper.normalizeVolatileFormsSecurity(result.structuredContent),
    };
    expect(createSnapshotResult(normalized)).toMatchSnapshot();
  });
});
