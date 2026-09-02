import { setupTestEnvironment, createMockRequestHandlerExtra, RecordTestFormHelper } from "./setup.js";
import updateRecordTool from "../put/update-record.js";

/**
 * ERROR-PATH ONLY — genuine gap, not worked around here.
 *
 * Same underlying blocker as get-record-audit-trail.test.ts: updating a record requires
 * a real, existing recordId (and real field IDs) to test a happy path, but this instance
 * has no forms with real submitted records and no Management API endpoint exists to
 * create one. Only the error path (updating an unknown recordId on a real form) can be
 * tested honestly.
 */
describe("update-record", () => {
  setupTestEnvironment();

  let formId: string;

  beforeAll(async () => {
    formId = await RecordTestFormHelper.createTestForm();
  });

  afterAll(async () => {
    await RecordTestFormHelper.deleteTestForm(formId);
  });

  it("should return error when updating a record that doesn't exist", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await updateRecordTool.handler(
      {
        formId,
        recordId: "00000000-0000-0000-0000-000000000001",
        fields: [
          {
            fieldId: "00000000-0000-0000-0000-000000000002",
            values: ["test value"],
          },
        ],
      },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
