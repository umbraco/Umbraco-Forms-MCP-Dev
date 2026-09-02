import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  PrevalueSourceBuilder,
} from "./setup.js";
import getPrevalueSourceValuesTool from "../get/get-prevalue-source-values.js";

const TEST_NAME = "_Test Get Prevalue Source Values";

describe("get-prevalue-source-values", () => {
  setupTestEnvironment();

  let builder: PrevalueSourceBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should resolve values for a prevalue source", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new PrevalueSourceBuilder().withName(TEST_NAME).create();

    const result = await getPrevalueSourceValuesTool.handler(
      { id: builder.getId(), formId: undefined, fieldId: undefined },
      context,
    );

    expect(createSnapshotResult(result, builder.getId())).toMatchSnapshot();
  });

  it("should return error for non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getPrevalueSourceValuesTool.handler(
      { id: "00000000-0000-0000-0000-000000000000", formId: undefined, fieldId: undefined },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
