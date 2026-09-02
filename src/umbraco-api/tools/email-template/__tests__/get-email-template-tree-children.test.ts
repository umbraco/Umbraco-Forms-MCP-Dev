import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
} from "./setup.js";
import getEmailTemplateTreeChildrenTool from "../get/get-email-template-tree-children.js";

const TEST_NON_EXISTENT_PARENT_PATH = "/_test-does-not-exist-folder";

describe("get-email-template-tree-children", () => {
  setupTestEnvironment();

  // Note: this connected Umbraco Forms instance's email template tree root only
  // contains a leaf template (no folders), so there is no real folder path to
  // exercise a happy-path "children of a folder" call. This asserts the
  // error path for a non-existent parent path instead.
  it("should return an error for a non-existent parent path", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getEmailTemplateTreeChildrenTool.handler(
      { parentPath: TEST_NON_EXISTENT_PARENT_PATH },
      context
    );

    expect(result.isError).toBe(true);
  });
});
