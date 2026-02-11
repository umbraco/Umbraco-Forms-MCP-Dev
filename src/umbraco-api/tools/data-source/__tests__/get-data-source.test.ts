import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  DataSourceBuilder,
  DataSourceTestHelper,
} from "./setup.js";
import getDataSourceTool from "../get/get-data-source.js";

const TEST_NAME = "_Test Get Data Source";

describe("get-data-source", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DataSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should return data source by ID", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new DataSourceBuilder()
      .withName(TEST_NAME)
      .create();

    const result = await getDataSourceTool.handler(
      { id: builder.getId() },
      context
    );

    expect(
      DataSourceTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });

  it("should return error for non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getDataSourceTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context
    );

    expect(result.isError).toBe(true);
  });
});
