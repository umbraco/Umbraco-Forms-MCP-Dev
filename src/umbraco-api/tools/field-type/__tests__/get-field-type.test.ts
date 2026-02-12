import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FieldTypeTestHelper,
} from "./setup.js";
import getFieldTypeTool from "../get/get-field-type.js";

describe("get-field-type", () => {
  setupTestEnvironment();

  it("should return field type by ID", async () => {
    const context = createMockRequestHandlerExtra();
    const firstType = await FieldTypeTestHelper.getFirst();

    const result = await getFieldTypeTool.handler(
      { id: firstType.id },
      context
    );

    expect(
      createSnapshotResult(result, firstType.id)
    ).toMatchSnapshot();
  });

  it("should return error for non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFieldTypeTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context
    );

    expect(result.isError).toBe(true);
  });
});
