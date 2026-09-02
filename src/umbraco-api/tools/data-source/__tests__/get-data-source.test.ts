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

  let builder: DataSourceBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should return a data source by id", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new DataSourceBuilder().withName(TEST_NAME).create();

    const result = await getDataSourceTool.handler({ id: builder.getId() }, context);

    // "unique" is a server-generated GUID independent of the client-supplied id, so it's
    // non-deterministic per run — normalize it (and settings, which can carry live secrets
    // like a SQL connection string) before snapshotting.
    const normalized = {
      ...result,
      structuredContent: DataSourceTestHelper.redactSettings(
        DataSourceTestHelper.normalizeIds(result.structuredContent),
      ),
    };

    expect(createSnapshotResult(normalized, builder.getId())).toMatchSnapshot();
  });

  it("should return error for a non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getDataSourceTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
