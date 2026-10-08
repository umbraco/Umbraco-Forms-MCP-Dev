import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  validateToolResponse,
  RecordTestFormHelper,
} from "./setup.js";
import createRecordTool from "../post/create-record.js";
import searchRecordsTool from "../get/search-records.js";

describe("create-record", () => {
  setupTestEnvironment();

  let formId: string;
  let fieldId: string;

  beforeAll(async () => {
    formId = await RecordTestFormHelper.createTestForm();
    [fieldId] = await RecordTestFormHelper.getFieldIds(formId);
  });

  afterAll(async () => {
    // Purging the form removes its records with it.
    await RecordTestFormHelper.deleteTestForm(formId);
  });

  it("should add an entry to the form", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createRecordTool.handler(
      { formId, fields: [{ fieldId, values: ["true"] }] },
      context,
    );

    const data = validateToolResponse(createRecordTool, result);
    expect(createSnapshotResult(result, data.id)).toMatchSnapshot();

    const search = await searchRecordsTool.handler(
      {
        formId,
        cursor: undefined,
        memberKey: undefined,
        sortBy: undefined,
        sortOrder: undefined,
        startDate: undefined,
        endDate: undefined,
        filter: undefined,
        states: undefined,
        recordId: undefined,
        recordIds: undefined,
      } as never,
      context,
    );
    const records = validateToolResponse(searchRecordsTool, search);
    expect(records.results.map((r) => r.uniqueId)).toContain(data.id);
  });

  it("should return an error for an unknown form", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createRecordTool.handler(
      { formId: "00000000-0000-0000-0000-000000000001", fields: [] },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
