import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  DataSourceTestHelper,
} from "./setup.js";
import getDataSourceScaffoldTool from "../get/get-data-source-scaffold.js";

describe("get-data-source-scaffold", () => {
  setupTestEnvironment();

  it("should return data source scaffold", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getDataSourceScaffoldTool.handler(
      {},
      context
    );

    expect(
      DataSourceTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });
});
