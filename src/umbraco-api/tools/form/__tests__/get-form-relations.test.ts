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

  beforeEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should return form relations", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FormBuilder().withName(TEST_NAME).create();

    // Retry — API may not be immediately consistent under parallel load
    let result: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      result = await getFormRelationsTool.handler(
        { id: builder.getId() },
        context
      );
      if (!result.isError) break;
      await new Promise((r) => setTimeout(r, 300));
    }

    expect(result.isError).toBeUndefined();
    const content = result.structuredContent as any;
    expect(content).toHaveProperty("items");
    expect(content).toHaveProperty("total");
    expect(Array.isArray(content.items)).toBe(true);
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
