import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  DataSourceTestHelper,
  SQL_DATA_SOURCE_TYPE_ID,
  DEFAULT_DATA_SOURCE_SETTINGS,
} from "./setup.js";
import createDataSourceTool from "../post/create-data-source.js";
import deleteDataSourceTool from "../delete/delete-data-source.js";

const TEST_NAME = "_Test Create Data Source";

describe("create-data-source", () => {
  setupTestEnvironment();

  let createdId: string | undefined;

  afterEach(async () => {
    const context = createMockRequestHandlerExtra();
    if (createdId) {
      await deleteDataSourceTool.handler({ id: createdId }, context);
      createdId = undefined;
    }
    await DataSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should create a new data source", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createDataSourceTool.handler(
      {
        name: TEST_NAME,
        formDataSourceTypeId: SQL_DATA_SOURCE_TYPE_ID,
        settings: DEFAULT_DATA_SOURCE_SETTINGS,
      },
      context,
    );

    createdId = (result.structuredContent as { id?: string } | undefined)?.id;

    expect(createSnapshotResult(result, createdId)).toMatchSnapshot();
  });

  it("should return error for an unknown data source type id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createDataSourceTool.handler(
      {
        name: TEST_NAME,
        formDataSourceTypeId: "00000000-0000-0000-0000-000000000000",
        settings: {},
      },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
