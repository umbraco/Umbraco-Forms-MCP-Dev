import {
  setupTestEnvironment,
  DataSourceBuilder,
  DataSourceTestHelper,
} from "../setup.js";

const TEST_NAME = "_Test Builder Data Source";

describe("DataSourceBuilder", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DataSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should create data source with builder", async () => {
    const builder = await new DataSourceBuilder()
      .withName(TEST_NAME)
      .create();

    expect(builder.getId()).toBeDefined();

    const found = await DataSourceTestHelper.findByName(TEST_NAME);
    expect(found).toBeDefined();
    expect(found?.name).toBe(TEST_NAME);
  });

  it("should build model without creating", () => {
    const builder = new DataSourceBuilder().withName(TEST_NAME);

    const model = builder.build();

    expect(model.name).toBe(TEST_NAME);
    expect(model.id).toBeDefined();
    expect(model.entityType).toBe("FormDataSource");
    expect(model.valid).toBe(true);
  });

  it("should throw error when getId called before create", () => {
    const builder = new DataSourceBuilder();

    expect(() => builder.getId()).toThrow(
      "Data source not created yet. Call create() first."
    );
  });
});
