import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  DataSourceBuilder,
  DataSourceTestHelper,
} from "./setup.js";
import listDataSourcesTool from "../get/list-data-sources.js";

const TEST_NAME = "_Test List Data Sources";

describe("list-data-sources", () => {
  setupTestEnvironment();

  beforeEach(async () => {
    await DataSourceTestHelper.cleanup(TEST_NAME);
  });

  afterEach(async () => {
    await DataSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should return paginated list of data sources", async () => {
    const context = createMockRequestHandlerExtra();
    await new DataSourceBuilder()
      .withName(`${TEST_NAME} 1`)
      .create();

    const result = await listDataSourcesTool.handler(
      { skip: 0, take: 100 },
      context
    );

    expect(result.isError).toBeUndefined();
    const items = (result.structuredContent as any)?.items;
    expect(Array.isArray(items)).toBe(true);
    const createdItem = items.find((item: any) => item.name === `${TEST_NAME} 1`);
    expect(createdItem).toBeDefined();
    expect(createdItem.entityType).toBe("datasource");
    expect(createdItem.formDataSourceTypeId).toBeDefined();
  });
});
