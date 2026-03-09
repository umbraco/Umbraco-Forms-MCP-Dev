import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FormBuilder,
  FormTestHelper,
} from "./setup.js";
import getFormTreeAncestorsTool from "../get/get-form-tree-ancestors.js";

const TEST_NAME = "_Test Tree Ancestors";

describe("get-form-tree-ancestors", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should return ancestors for a form at root", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await getFormTreeAncestorsTool.handler(
      { descendantId: builder.getId() },
      context
    );

    expect(FormTestHelper.normalizeIds(result)).toMatchSnapshot();
  });

  it("should return empty ancestors for non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFormTreeAncestorsTool.handler(
      { descendantId: "00000000-0000-0000-0000-000000000000" },
      context
    );

    expect(FormTestHelper.normalizeIds(result)).toMatchSnapshot();
  });
});
