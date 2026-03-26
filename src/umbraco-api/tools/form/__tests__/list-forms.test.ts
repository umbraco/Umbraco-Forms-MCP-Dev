import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FormBuilder,
  FormTestHelper,
} from "./setup.js";
import listFormsTool from "../get/list-forms.js";

const TEST_NAME = "_Test List Forms";

describe("list-forms", () => {
  setupTestEnvironment();

  beforeEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should return list of forms including created form", async () => {
    const context = createMockRequestHandlerExtra();
    await new FormBuilder().withName(TEST_NAME).create();

    const result = await listFormsTool.handler({}, context);

    expect(result.isError).toBeUndefined();
    const items = (result.structuredContent as any)?.items;
    expect(Array.isArray(items)).toBe(true);
    const createdItem = items.find((item: any) => item.name === TEST_NAME);
    expect(createdItem).toBeDefined();
    expect(createdItem.id).toBeDefined();
    expect(createdItem.summary).toContain("1 page form");
  });
});
