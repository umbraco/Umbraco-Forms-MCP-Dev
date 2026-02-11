import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FormBuilder,
  FormTestHelper,
} from "./setup.js";
import deleteFormTool from "../delete/delete-form.js";

const TEST_NAME = "_Test Delete Form";

describe("delete-form", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should delete a form", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await deleteFormTool.handler(
      { id: builder.getId() },
      context
    );

    expect(FormTestHelper.normalizeIds(result)).toMatchSnapshot();
  });

  it("should return error for non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteFormTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context
    );

    expect(result.isError).toBe(true);
  });
});
