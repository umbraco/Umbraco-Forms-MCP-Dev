import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  DataSourceBuilder,
  DataSourceTestHelper,
} from "./setup.js";
import updateDataSourceTool from "../put/update-data-source.js";
import getDataSourceTool from "../get/get-data-source.js";

const TEST_NAME = "_Test Update Data Source";

describe("update-data-source", () => {
  setupTestEnvironment();

  let builder: DataSourceBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should update a data source's name", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new DataSourceBuilder().withName(TEST_NAME).create();

    const result = await updateDataSourceTool.handler(
      {
        id: builder.getId(),
        name: `${TEST_NAME} Updated`,
        formDataSourceTypeId: undefined,
        settings: undefined,
      },
      context,
    );

    expect(createSnapshotResult(result, builder.getId())).toMatchSnapshot();

    const updated = await getDataSourceTool.handler({ id: builder.getId() }, context);
    const normalized = DataSourceTestHelper.normalizeIds(updated.structuredContent) as {
      name?: string;
    };
    expect(normalized.name).toBe(`${TEST_NAME} Updated`);
  });

  it("should return error for a non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await updateDataSourceTool.handler(
      {
        id: "00000000-0000-0000-0000-000000000000",
        name: TEST_NAME,
        formDataSourceTypeId: undefined,
        settings: undefined,
      },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
