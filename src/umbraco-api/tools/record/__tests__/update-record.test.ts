import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  RecordBuilder,
  RecordTestHelper,
} from "./setup.js";
import updateRecordTool from "../put/update-record.js";

const TEST_NAME = "_Test Update Record";

describe("update-record", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await RecordTestHelper.cleanup(TEST_NAME);
  });

  it("should update record field values", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new RecordBuilder()
      .withFormName(TEST_NAME)
      .withFieldValue("Original Value")
      .create();

    // Get the list of records to find the field ID
    const records = await RecordTestHelper.findByFormId(builder.getFormId());
    const record = records.find(r => r.uniqueId === builder.getRecordId());
    const nameField = record?.fields?.find(f => f.value === "Original Value");

    if (!nameField) {
      throw new Error("Could not find name field in record");
    }

    const result = await updateRecordTool.handler(
      {
        formId: builder.getFormId(),
        recordId: builder.getRecordId(),
        fields: [
          {
            fieldId: nameField.fieldId,
            values: ["Updated Value"],
          },
        ],
      },
      context
    );

    expect(RecordTestHelper.normalizeIds(result)).toMatchSnapshot();
  });

  it("should return error for non-existent record ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await updateRecordTool.handler(
      {
        formId: "00000000-0000-0000-0000-000000000000",
        recordId: "00000000-0000-0000-0000-000000000000",
        fields: [
          {
            fieldId: "00000000-0000-0000-0000-000000000000",
            values: ["Test"],
          },
        ],
      },
      context
    );

    expect(result.isError).toBe(true);
  });
});
