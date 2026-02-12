import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  PrevalueSourceTypeTestHelper,
} from "./setup.js";
import getPrevalueSourceTypeTool from "../get/get-prevalue-source-type.js";

describe("get-prevalue-source-type", () => {
  setupTestEnvironment();

  it("should return prevalue source type by ID", async () => {
    const context = createMockRequestHandlerExtra();
    const firstType = await PrevalueSourceTypeTestHelper.getFirst();

    const result = await getPrevalueSourceTypeTool.handler(
      { id: firstType.id },
      context
    );

    expect(
      createSnapshotResult(result, firstType.id)
    ).toMatchSnapshot();
  });

  it("should return error for non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getPrevalueSourceTypeTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context
    );

    expect(result.isError).toBe(true);
  });
});
