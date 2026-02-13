import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FormTestHelper,
} from "./setup.js";
import listFormTemplatesTool from "../get/list-form-templates.js";

describe("list-form-templates", () => {
  setupTestEnvironment();

  it("should return list of form templates", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listFormTemplatesTool.handler({}, context);

    expect(FormTestHelper.normalizeIds(result)).toMatchSnapshot();
  });
});
