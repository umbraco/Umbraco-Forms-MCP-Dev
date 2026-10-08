import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FormBuilder,
  FormTestHelper,
} from "./setup.js";
import deleteFormTool from "../delete/delete-form.js";
import { purgeForm } from "../../../../testing/purge.js";

const TEST_NAME = "_Test Delete Form";

describe("delete-form", () => {
  setupTestEnvironment();

  it("should delete an existing form", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await deleteFormTool.handler({ id: builder.getId() }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();

    // Gone from the live forms; on Forms 17.6 / 18.2 it is in the recycle bin instead.
    const found = await FormTestHelper.findByName(TEST_NAME);
    expect(found).toBeUndefined();

    await purgeForm(builder.getId());
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
