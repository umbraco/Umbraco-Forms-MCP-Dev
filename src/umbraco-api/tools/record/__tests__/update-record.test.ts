import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult, RecordTestFormHelper } from "./setup.js";
import { RecordEntryHelper } from "./helpers/record-entry-helper.js";
import {
  FormSubmissionBuilder,
  TEST_FIELD_ALIAS,
} from "../../form-submission/__tests__/helpers/form-submission-builder.js";
import updateRecordTool from "../put/update-record.js";

describe("update-record", () => {
  setupTestEnvironment();

  let builder: FormSubmissionBuilder;
  let fieldId: string;

  beforeAll(async () => {
    // A form with a free-text field, so any value passes the field's validation.
    builder = await new FormSubmissionBuilder().withName("_Test Update Record").create();
    const fields = (builder.getDesign().pages as any)[0].fieldSets[0].containers[0].fields;
    fieldId = fields.find((field: { alias: string }) => field.alias === TEST_FIELD_ALIAS).id;
  });

  afterAll(async () => {
    await builder?.delete();
  });

  it("should overwrite a field value on an existing entry", async () => {
    const context = createMockRequestHandlerExtra();
    const formId = builder.getId();
    const recordId = await RecordEntryHelper.createEntry(formId, fieldId, "Ada");

    const result = await updateRecordTool.handler({ formId, recordId, fields: [{ fieldId, values: ["Grace"] }] }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
    const entry = await RecordEntryHelper.getEntry(formId, recordId);
    expect(entry?.fields.find((field) => field.fieldId === fieldId)?.value).toBe("Grace");
  });

  it("should return error when updating a record that doesn't exist", async () => {
    const context = createMockRequestHandlerExtra();
    const formId = await RecordTestFormHelper.createTestForm();

    try {
      const result = await updateRecordTool.handler(
        {
          formId,
          recordId: "00000000-0000-0000-0000-000000000001",
          fields: [{ fieldId: "00000000-0000-0000-0000-000000000002", values: ["test value"] }],
        },
        context,
      );

      expect(result.isError).toBe(true);
    } finally {
      await RecordTestFormHelper.deleteTestForm(formId);
    }
  });
});
