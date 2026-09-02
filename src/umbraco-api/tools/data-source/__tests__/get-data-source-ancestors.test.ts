import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  DataSourceBuilder,
} from "./setup.js";
import getDataSourceAncestorsTool from "../get/get-data-source-ancestors.js";

const TEST_NAME = "_Test Data Source Ancestors";

describe("get-data-source-ancestors", () => {
  setupTestEnvironment();

  let builder: DataSourceBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should return the ancestors for a root-level data source", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new DataSourceBuilder().withName(TEST_NAME).create();

    const result = await getDataSourceAncestorsTool.handler(
      { descendantId: builder.getId() },
      context,
    );

    expect(createSnapshotResult(result, builder.getId())).toMatchSnapshot();
  });

  it("should return root-level ancestors when descendantId is omitted", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getDataSourceAncestorsTool.handler({ descendantId: undefined }, context);

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
