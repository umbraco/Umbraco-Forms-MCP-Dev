import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  RecordTestFormHelper,
} from "./setup.js";
import getRecordPageNumberTool from "../get/get-record-page-number.js";

/**
 * See search-records.test.ts for why no form on this instance has real submitted
 * records — there is no real recordId to locate a page for. This documents the tool's
 * real (non-mocked) response when asked to locate a recordId that doesn't exist on a
 * real, empty form.
 */
describe("get-record-page-number", () => {
  setupTestEnvironment();

  let formId: string;

  beforeAll(async () => {
    formId = await RecordTestFormHelper.createTestForm();
  });

  afterAll(async () => {
    await RecordTestFormHelper.deleteTestForm(formId);
  });

  it("should return no page number for a record that doesn't exist", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getRecordPageNumberTool.handler(
      {
        formId,
        recordId: "00000000-0000-0000-0000-000000000001",
        cursor: undefined,
        memberKey: undefined,
        sortBy: undefined,
        sortOrder: undefined,
        startDate: undefined,
        endDate: undefined,
        filter: undefined,
        states: undefined,
        recordIds: undefined,
      },
      context,
    );

    expect(createSnapshotResult(result, formId)).toMatchSnapshot();
  });

  it("should return no page number for a non-existent form (does not error)", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getRecordPageNumberTool.handler(
      {
        formId: "00000000-0000-0000-0000-000000000000",
        recordId: "00000000-0000-0000-0000-000000000001",
        cursor: undefined,
        memberKey: undefined,
        sortBy: undefined,
        sortOrder: undefined,
        startDate: undefined,
        endDate: undefined,
        filter: undefined,
        states: undefined,
        recordIds: undefined,
      },
      context,
    );

    // Verified against the real API: like get-record-metadata (and unlike search-records),
    // this endpoint does not 404 for an unknown formId — it just reports no page number.
    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
