import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FormBuilder,
  FormTestHelper,
} from "./setup.js";
import getFormTreeTool from "../get/get-form-tree.js";

const TEST_NAME = "_Test Get Form Tree";

describe("get-form-tree", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should return form tree including created form", async () => {
    const context = createMockRequestHandlerExtra();
    await new FormBuilder().withName(TEST_NAME).create();

    const result = await getFormTreeTool.handler({ parentId: undefined }, context);

    expect(
      FormTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });
});
