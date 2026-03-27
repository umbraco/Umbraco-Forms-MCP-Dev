import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  DataSourceBuilder,
  DataSourceTestHelper,
} from "./setup.js";
import getDataSourceTreeTool from "../get/get-data-source-tree.js";

const TEST_NAME = "_Test Get Data Source Tree";

describe("get-data-source-tree", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DataSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should return data source tree", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new DataSourceBuilder()
      .withName(TEST_NAME)
      .create();

    const result = await getDataSourceTreeTool.handler(
      {},
      context
    );

    expect(
      DataSourceTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });
});
