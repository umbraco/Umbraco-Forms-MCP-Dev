import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FormTestHelper,
} from "./setup.js";
import getFormScaffoldTool from "../get/get-form-scaffold.js";

describe("get-form-scaffold", () => {
  setupTestEnvironment();

  it("should return empty form scaffold", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFormScaffoldTool.handler({}, context);

    expect(FormTestHelper.normalizeIds(result)).toMatchSnapshot();
  });
});
