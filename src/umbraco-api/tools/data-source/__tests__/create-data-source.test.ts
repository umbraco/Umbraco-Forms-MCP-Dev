import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  DataSourceTestHelper,
} from "./setup.js";
import createDataSourceTool from "../post/create-data-source.js";

const TEST_NAME = "_Test Create Data Source";
const TEST_DATA_SOURCE_TYPE_ID = "12345678-0000-0000-0000-000000000001";

describe("create-data-source", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DataSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should create a new data source", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createDataSourceTool.handler(
      {
        name: TEST_NAME,
        formDataSourceTypeId: TEST_DATA_SOURCE_TYPE_ID,
        settings: undefined,
      },
      context
    );

    expect(
      DataSourceTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });

  it("should create a data source with settings", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createDataSourceTool.handler(
      {
        name: `${TEST_NAME} With Settings`,
        formDataSourceTypeId: TEST_DATA_SOURCE_TYPE_ID,
        settings: { key1: "value1", key2: "value2" },
      },
      context
    );

    expect(
      DataSourceTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });
});
