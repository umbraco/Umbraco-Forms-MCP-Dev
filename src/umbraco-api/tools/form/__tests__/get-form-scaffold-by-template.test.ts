import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FormTestHelper,
} from "./setup.js";
import getFormScaffoldByTemplateTool from "../get/get-form-scaffold-by-template.js";

describe("get-form-scaffold-by-template", () => {
  setupTestEnvironment();

  it("should return scaffold from template", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFormScaffoldByTemplateTool.handler(
      { template: "contactform" },
      context
    );

    expect(FormTestHelper.normalizeIds(result)).toMatchSnapshot();
  });

  it("should return error for non-existent template", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFormScaffoldByTemplateTool.handler(
      { template: "nonexistent-template-xyz" },
      context
    );

    expect(result.isError).toBe(true);
  });
});
