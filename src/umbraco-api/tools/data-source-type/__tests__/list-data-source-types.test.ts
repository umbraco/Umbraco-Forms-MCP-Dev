import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  DataSourceTypeTestHelper,
} from "./setup.js";
import listDataSourceTypesTool from "../get/list-data-source-types.js";

describe("list-data-source-types", () => {
  setupTestEnvironment();

  it("should list registered data source types", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listDataSourceTypesTool.handler({}, context);

    expect(
      DataSourceTypeTestHelper.normalizeSettingDefaults(
        createSnapshotResult(result),
      ),
    ).toMatchSnapshot();
  });
});
