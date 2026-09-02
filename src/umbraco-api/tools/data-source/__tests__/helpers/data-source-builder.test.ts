import {
  setupTestEnvironment,
  DataSourceBuilder,
  DataSourceTestHelper,
} from "../setup.js";

const TEST_NAME = "_Test Builder Data Source";

describe("DataSourceBuilder", () => {
  setupTestEnvironment();

  let builder: DataSourceBuilder;

  afterEach(async () => {
    // Always clean up created entities to prevent conflicts with other test files
    if (builder) await builder.delete();
    await DataSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should create a data source with the builder", async () => {
    builder = await new DataSourceBuilder().withName(TEST_NAME).create();

    expect(builder.getId()).toBeDefined();

    const found = await DataSourceTestHelper.findByName(TEST_NAME);
    expect(found).toBeDefined();
    expect(found?.name).toBe(TEST_NAME);
  });
});
