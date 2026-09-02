import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  DataSourceBuilder,
} from "./setup.js";
import getDataSourceTreeRootTool from "../get/get-data-source-tree-root.js";

const TEST_NAME = "_Test Data Source Tree Root";

describe("get-data-source-tree-root", () => {
  setupTestEnvironment();

  let builder: DataSourceBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should return the root-level items of the data source tree", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new DataSourceBuilder().withName(TEST_NAME).create();

    const result = await getDataSourceTreeRootTool.handler({}, context);

    expect(result.isError).toBeFalsy();
    const structuredContent = result.structuredContent as
      | { items?: Array<{ id: string; name: string }> }
      | undefined;
    expect(
      structuredContent?.items?.some((item) => item.id === builder.getId()),
    ).toBe(true);
  });
});
