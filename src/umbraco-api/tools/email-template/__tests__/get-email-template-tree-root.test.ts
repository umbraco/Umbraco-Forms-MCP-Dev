import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getEmailTemplateTreeRootTool from "../get/get-email-template-tree-root.js";

describe("get-email-template-tree-root", () => {
  setupTestEnvironment();

  it("should return the root-level items of the email template tree", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getEmailTemplateTreeRootTool.handler({}, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
