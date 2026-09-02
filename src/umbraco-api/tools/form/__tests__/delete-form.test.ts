import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FormBuilder,
  FormTestHelper,
} from "./setup.js";
import deleteFormTool from "../delete/delete-form.js";

const TEST_NAME = "_Test Delete Form";

describe("delete-form", () => {
  setupTestEnvironment();

  it("should delete an existing form", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await deleteFormTool.handler({ id: builder.getId() }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();

    const found = await FormTestHelper.findByName(TEST_NAME);
    expect(found).toBeUndefined();
  });

  it("should return an error for a non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteFormTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
