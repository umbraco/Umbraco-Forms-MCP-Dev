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

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should return list of forms including created form", async () => {
    const context = createMockRequestHandlerExtra();
    await new FormBuilder().withName(TEST_NAME).create();

    const result = await listFormsTool.handler({}, context);

    expect(result.isError).toBeUndefined();
    const forms = (result as any).structuredContent;
    expect(Array.isArray(forms)).toBe(true);
    expect(forms.some((f: any) => f.name === TEST_NAME)).toBe(true);
  });
});
