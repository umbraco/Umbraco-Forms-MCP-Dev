import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  PrevalueSourceBuilder,
  PrevalueSourceTestHelper,
} from "./setup.js";
import getPrevalueSourceTool from "../get/get-prevalue-source.js";

const TEST_NAME = "_Test Get Prevalue Source";

describe("get-prevalue-source", () => {
  setupTestEnvironment();

  let builder: PrevalueSourceBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should return a prevalue source by id", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new PrevalueSourceBuilder().withName(TEST_NAME).create();

    const result = await getPrevalueSourceTool.handler({ id: builder.getId() }, context);

    const snapshot = createSnapshotResult(result, builder.getId());
    expect(
      PrevalueSourceTestHelper.normalizeVolatileFields(snapshot),
    ).toMatchSnapshot();
  });

  it("should return error for non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getPrevalueSourceTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
