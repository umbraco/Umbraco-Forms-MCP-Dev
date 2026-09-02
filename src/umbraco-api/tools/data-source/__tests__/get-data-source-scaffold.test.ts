import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  DataSourceTestHelper,
} from "./setup.js";
import getDataSourceScaffoldTool from "../get/get-data-source-scaffold.js";

describe("get-data-source-scaffold", () => {
  setupTestEnvironment();

  it("should return a blank data source scaffold", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getDataSourceScaffoldTool.handler({}, context);

    // The scaffold's "id"/"unique" and "settings" (which can carry secrets like a SQL
    // connection string) vary per call — normalize/redact before snapshotting.
    const normalized = {
      ...result,
      structuredContent: DataSourceTestHelper.redactSettings(
        DataSourceTestHelper.normalizeIds(result.structuredContent),
      ),
    };

    expect(createSnapshotResult(normalized)).toMatchSnapshot();
  });
});
