import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  DataSourceTypeTestHelper,
} from "./setup.js";
import getDataSourceTypeTool from "../get/get-data-source-type.js";

describe("get-data-source-type", () => {
  setupTestEnvironment();

  it("should return data source type by ID", async () => {
    const context = createMockRequestHandlerExtra();
    const firstType = await DataSourceTypeTestHelper.getFirst();

    const result = await getDataSourceTypeTool.handler(
      { id: firstType.id },
      context
    );

    expect(
      createSnapshotResult(result, firstType.id)
    ).toMatchSnapshot();
  });

  it("should return error for non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getDataSourceTypeTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context
    );

    expect(result.isError).toBe(true);
  });
});
