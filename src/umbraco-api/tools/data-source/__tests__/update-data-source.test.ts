import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  DataSourceBuilder,
  DataSourceTestHelper,
} from "./setup.js";
import updateDataSourceTool from "../put/update-data-source.js";

const TEST_NAME = "_Test Update Data Source";

describe("update-data-source", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DataSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should update a data source name", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new DataSourceBuilder()
      .withName(TEST_NAME)
      .create();

    const result = await updateDataSourceTool.handler(
      {
        id: builder.getId(),
        name: `${TEST_NAME} Updated`,
        formDataSourceTypeId: undefined,
        settings: undefined,
      },
      context
    );

    expect(
      DataSourceTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });

  it("should return error for non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await updateDataSourceTool.handler(
      {
        id: "00000000-0000-0000-0000-000000000000",
        name: `${TEST_NAME} Updated`,
        formDataSourceTypeId: undefined,
        settings: undefined,
      },
      context
    );

    expect(result.isError).toBe(true);
  });
});
