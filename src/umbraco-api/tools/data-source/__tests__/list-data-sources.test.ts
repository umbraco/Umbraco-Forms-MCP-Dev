import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  DataSourceBuilder,
  DataSourceTestHelper,
} from "./setup.js";
import listDataSourcesTool from "../get/list-data-sources.js";

const TEST_NAME = "_Test List Data Sources";

describe("list-data-sources", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DataSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should return paginated list of data sources", async () => {
    const context = createMockRequestHandlerExtra();
    await new DataSourceBuilder()
      .withName(`${TEST_NAME} 1`)
      .create();

    const result = await listDataSourcesTool.handler(
      { skip: 0, take: 10 },
      context
    );

    expect(
      DataSourceTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });
});
