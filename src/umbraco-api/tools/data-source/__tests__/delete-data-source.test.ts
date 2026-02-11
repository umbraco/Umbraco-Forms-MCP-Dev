import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  DataSourceBuilder,
  DataSourceTestHelper,
} from "./setup.js";
import deleteDataSourceTool from "../delete/delete-data-source.js";

const TEST_NAME = "_Test Delete Data Source";

describe("delete-data-source", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DataSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should delete a data source", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new DataSourceBuilder()
      .withName(TEST_NAME)
      .create();

    const result = await deleteDataSourceTool.handler(
      { id: builder.getId() },
      context
    );

    expect(
      DataSourceTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });

  it("should return error for non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteDataSourceTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context
    );

    expect(result.isError).toBe(true);
  });
});
