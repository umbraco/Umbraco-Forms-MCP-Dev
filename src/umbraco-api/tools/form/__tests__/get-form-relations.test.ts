import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FormBuilder,
  FormTestHelper,
} from "./setup.js";
import getFormRelationsTool from "../get/get-form-relations.js";

const TEST_NAME = "_Test Get Form Relations";

describe("get-form-relations", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should return form relations", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await getFormRelationsTool.handler(
      { id: builder.getId() },
      context
    );

    expect(FormTestHelper.normalizeIds(result)).toMatchSnapshot();
  });

  it("should return error for non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFormRelationsTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context
    );

    expect(result.isError).toBe(true);
  });
});
