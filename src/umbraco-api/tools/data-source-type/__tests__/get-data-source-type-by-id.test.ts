import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getDataSourceTypeByIdTool from "../get/get-data-source-type-by-id.js";
import listDataSourceTypesTool from "../get/list-data-source-types.js";

const TEST_BOGUS_ID = "00000000-0000-0000-0000-000000000000";

describe("get-data-source-type-by-id", () => {
  setupTestEnvironment();

  it("should return a data source type by id", async () => {
    const context = createMockRequestHandlerExtra();

    const listResult = await listDataSourceTypesTool.handler({}, context);
    const items = (listResult.structuredContent as { items: { id: string }[] })
      .items;
    expect(items.length).toBeGreaterThan(0);
    const id = items[0].id;

    const result = await getDataSourceTypeByIdTool.handler({ id }, context);

    expect(createSnapshotResult(result, id)).toMatchSnapshot();
  });

  it("should return error for non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getDataSourceTypeByIdTool.handler(
      { id: TEST_BOGUS_ID },
      context
    );

    expect(result.isError).toBe(true);
  });
});
