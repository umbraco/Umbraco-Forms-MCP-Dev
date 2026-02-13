import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FormTestHelper,
} from "./setup.js";
import createFormTool from "../post/create-form.js";

const TEST_NAME = "_Test Create Form";

describe("create-form", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should create a new form", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createFormTool.handler(
      {
        name: TEST_NAME,
        folderId: undefined,
      },
      context
    );

    expect(FormTestHelper.normalizeIds(result)).toMatchSnapshot();

    // Verify the form was actually created
    const found = await FormTestHelper.findByName(TEST_NAME);
    expect(found).toBeDefined();
    expect(found!.name).toBe(TEST_NAME);
  });
});
