import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FormBuilder,
  FormTestHelper,
} from "./setup.js";
import moveFormTool from "../put/move-form.js";

const TEST_NAME = "_Test Move Form";

describe("move-form", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should move a form to root", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await moveFormTool.handler(
      {
        id: builder.getId(),
        parentId: null,
      },
      context
    );

    expect(FormTestHelper.normalizeIds(result)).toMatchSnapshot();
  });

  it("should return error for non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await moveFormTool.handler(
      {
        id: "00000000-0000-0000-0000-000000000000",
        parentId: null,
      },
      context
    );

    expect(result.isError).toBe(true);
  });
});
