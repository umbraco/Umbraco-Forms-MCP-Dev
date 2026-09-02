import {
  setupTestEnvironment,
  PrevalueSourceBuilder,
  PrevalueSourceTestHelper,
} from "../setup.js";

const TEST_NAME = "_Test Builder Prevalue Source";

describe("PrevalueSourceBuilder", () => {
  setupTestEnvironment();

  let builder: PrevalueSourceBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
    await PrevalueSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should create a prevalue source with builder", async () => {
    builder = await new PrevalueSourceBuilder().withName(TEST_NAME).create();

    expect(builder.getId()).toBeDefined();
    expect(builder.getProviderTypeId()).toBeDefined();

    const found = await PrevalueSourceTestHelper.findByName(TEST_NAME);
    expect(found).toBeDefined();
    expect(found?.name).toBe(TEST_NAME);
    expect(found?.fieldPreValueSourceTypeId).toBe(builder.getProviderTypeId());
  });
});
