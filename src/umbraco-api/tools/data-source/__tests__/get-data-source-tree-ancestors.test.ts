import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  DataSourceBuilder,
  DataSourceTestHelper,
} from "./setup.js";
import getDataSourceTreeAncestorsTool from "../get/get-data-source-tree-ancestors.js";

const TEST_NAME = "_Test Get Data Source Tree Ancestors";

describe("get-data-source-tree-ancestors", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DataSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should return tree ancestors for a data source", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new DataSourceBuilder()
      .withName(TEST_NAME)
      .create();

    const result = await getDataSourceTreeAncestorsTool.handler(
      { descendantId: builder.getId() },
      context
    );

    expect(
      DataSourceTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });

  it("should return empty array when descendantId is omitted", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getDataSourceTreeAncestorsTool.handler(
      { descendantId: undefined },
      context
    );

    expect(
      DataSourceTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });
});
