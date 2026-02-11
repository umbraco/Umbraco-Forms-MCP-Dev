import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FormBuilder,
  FormTestHelper,
} from "./setup.js";
import copyFormTool from "../post/copy-form.js";

const TEST_NAME = "_Test Copy Form";

describe("copy-form", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should copy a form", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await copyFormTool.handler(
      {
        id: builder.getId(),
        newName: `${TEST_NAME} Copy`,
        copyWorkflows: true,
        copyToFolderId: undefined,
      },
      context
    );

    expect(FormTestHelper.normalizeIds(result)).toMatchSnapshot();

    const copy = await FormTestHelper.findByName(`${TEST_NAME} Copy`);
    expect(copy).toBeDefined();
  });

  it("should return error for non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await copyFormTool.handler(
      {
        id: "00000000-0000-0000-0000-000000000000",
        newName: `${TEST_NAME} Copy`,
        copyWorkflows: true,
        copyToFolderId: undefined,
      },
      context
    );

    expect(result.isError).toBe(true);
  });
});
