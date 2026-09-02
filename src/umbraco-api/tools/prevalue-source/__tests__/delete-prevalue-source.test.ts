import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  PrevalueSourceBuilder,
  PrevalueSourceTestHelper,
} from "./setup.js";
import deletePrevalueSourceTool from "../delete/delete-prevalue-source.js";

const TEST_NAME = "_Test Delete Prevalue Source";

describe("delete-prevalue-source", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await PrevalueSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should delete a prevalue source", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new PrevalueSourceBuilder().withName(TEST_NAME).create();

    const result = await deletePrevalueSourceTool.handler({ id: builder.getId() }, context);

    expect(result.isError).toBeFalsy();

    const found = await PrevalueSourceTestHelper.findByName(TEST_NAME);
    expect(found).toBeUndefined();
  });

  it("should return error for non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deletePrevalueSourceTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
