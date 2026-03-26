import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  DataSourceBuilder,
  DataSourceTestHelper,
} from "./setup.js";
import getDataSourceTreeTool from "../get/get-data-source-tree.js";

const TEST_NAME = "_Test Get Data Source Tree";

describe("get-data-source-tree", () => {
  setupTestEnvironment();

  beforeEach(async () => {
    await DataSourceTestHelper.cleanup(TEST_NAME);
  });

  afterEach(async () => {
    await DataSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should return data source tree", async () => {
    const context = createMockRequestHandlerExtra();
    await new DataSourceBuilder()
      .withName(TEST_NAME)
      .create();

    const result = await getDataSourceTreeTool.handler(
      {},
      context
    );

    expect(result.isError).toBeUndefined();
    const items = (result.structuredContent as any)?.items;
    expect(Array.isArray(items)).toBe(true);
    const createdItem = items.find((item: any) => item.name === TEST_NAME);
    expect(createdItem).toBeDefined();
    expect(createdItem.isFolder).toBe(false);
    expect(createdItem.hasChildren).toBe(false);
    expect(createdItem.icon).toBe("icon-database");
  });
});
