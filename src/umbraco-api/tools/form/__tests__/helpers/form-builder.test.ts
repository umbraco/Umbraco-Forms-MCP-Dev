import {
  setupTestEnvironment,
  FormBuilder,
  FormTestHelper,
} from "../setup.js";

const TEST_NAME = "_Test Builder Form";

describe("FormBuilder", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should create form with builder", async () => {
    const builder = await new FormBuilder()
      .withName(TEST_NAME)
      .create();

    expect(builder.getId()).toBeDefined();

    const found = await FormTestHelper.findByName(TEST_NAME);
    expect(found).toBeDefined();
    expect(found?.name).toBe(TEST_NAME);
  });

  it("should build model without creating", () => {
    const builder = new FormBuilder().withName(TEST_NAME);

    const model = builder.build();

    expect(model.name).toBe(TEST_NAME);
    expect(model.id).toBeDefined();
    expect(model.entityType).toBe("Form");
    expect(model.pages).toHaveLength(1);
  });

  it("should throw error when getId called before create", () => {
    const builder = new FormBuilder();

    expect(() => builder.getId()).toThrow(
      "Form not created yet. Call create() first."
    );
  });
});
