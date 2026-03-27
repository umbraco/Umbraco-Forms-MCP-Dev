import {
  setupTestEnvironment,
  RecordBuilder,
  RecordTestHelper,
} from "../setup.js";

const TEST_NAME = "_Test Builder Record";

describe("RecordBuilder", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await RecordTestHelper.cleanup(TEST_NAME);
  });

  it("should create record with builder", async () => {
    // Arrange & Act
    const builder = await new RecordBuilder()
      .withFormName(TEST_NAME)
      .withFieldValue("Test submission value")
      .create();

    // Assert
    expect(builder.getFormId()).toBeDefined();
    expect(builder.getRecordId()).toBeDefined();

    // Verify the record exists
    const formId = builder.getFormId();
    const recordId = builder.getRecordId();
    const found = await RecordTestHelper.findByUniqueId(formId, recordId);

    expect(found).toBeDefined();
    expect(found?.uniqueId).toBe(recordId);
    expect(found?.form).toBe(formId);
  });

  it("should create record with custom field value", async () => {
    // Arrange & Act
    const customValue = "Custom test value";
    const builder = await new RecordBuilder()
      .withFormName(TEST_NAME)
      .withFieldValue(customValue)
      .create();

    // Assert
    const records = await RecordTestHelper.findByFormId(builder.getFormId());
    expect(records).toHaveLength(1);

    const record = records[0];
    expect(record.fields).toBeDefined();
    expect(record.fields.length).toBeGreaterThan(0);

    // Verify the field value is in the record (FieldData uses fieldId and value)
    const fieldWithValue = record.fields.find(
      (f) => f.value !== null && f.value !== undefined
    );
    expect(fieldWithValue).toBeDefined();
    expect(fieldWithValue?.value).toBe(customValue);
  });

  it("should throw error when getFormId called before create", () => {
    const builder = new RecordBuilder();

    expect(() => builder.getFormId()).toThrow(
      "Record not created yet. Call create() first."
    );
  });

  it("should throw error when getRecordId called before create", () => {
    const builder = new RecordBuilder();

    expect(() => builder.getRecordId()).toThrow(
      "Record not created yet. Call create() first."
    );
  });
});
