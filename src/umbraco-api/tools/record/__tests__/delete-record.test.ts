import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  validateToolResponse,
  RecordTestFormHelper,
} from "./setup.js";
import deleteRecordTool from "../delete/delete-record.js";
import createRecordTool from "../post/create-record.js";

describe("delete-record", () => {
  setupTestEnvironment();

  let formId: string;
  let fieldId: string;

  beforeAll(async () => {
    formId = await RecordTestFormHelper.createTestForm();
    [fieldId] = await RecordTestFormHelper.getFieldIds(formId);
  });

  afterAll(async () => {
    await RecordTestFormHelper.deleteTestForm(formId);
  });

  async function createRecord(): Promise<string> {
    const result = await createRecordTool.handler(
      { formId, fields: [{ fieldId, values: ["true"] }] },
      createMockRequestHandlerExtra(),
    );
    return validateToolResponse(createRecordTool, result).id;
  }

  it("should delete an entry", async () => {
    const context = createMockRequestHandlerExtra();
    const recordId = await createRecord();

    await RecordTestFormHelper.withDeleteEntriesPermission(async () => {
      const result = await deleteRecordTool.handler({ formId, recordId }, context);
      expect(createSnapshotResult(result)).toMatchSnapshot();

      // Deleting it again fails: it is gone.
      const again = await deleteRecordTool.handler({ formId, recordId }, context);
      expect(again.isError).toBe(true);
    });
  });

  it("should be refused without the delete entries permission", async () => {
    const context = createMockRequestHandlerExtra();
    const recordId = await createRecord();

    const result = await deleteRecordTool.handler({ formId, recordId }, context);

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toMatchObject({ status: 403 });
  });
});
