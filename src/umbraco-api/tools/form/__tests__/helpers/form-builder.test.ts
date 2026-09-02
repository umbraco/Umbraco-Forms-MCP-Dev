import { setupTestEnvironment, FormBuilder, FormTestHelper } from "../setup.js";

const TEST_NAME = "_Test Builder Form";

describe("FormBuilder", () => {
  setupTestEnvironment();

  let builder: FormBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should create a form with the builder", async () => {
    builder = await new FormBuilder().withName(TEST_NAME).create();

    expect(builder.getId()).toBeDefined();
    expect(builder.getDesign().name).toBe(TEST_NAME);

    const found = await FormTestHelper.findByName(TEST_NAME);
    expect(found).toBeDefined();
    expect(found?.name).toBe(TEST_NAME);
  });
});
