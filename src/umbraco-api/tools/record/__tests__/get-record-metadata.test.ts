import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  RecordTestFormHelper,
} from "./setup.js";
import getRecordMetadataTool from "../get/get-record-metadata.js";

/**
 * See search-records.test.ts for why no form on this instance has real submitted
 * records. A count of zero for a real, empty form is still a genuine response from
 * the real API, not a fabricated one.
 */
describe("get-record-metadata", () => {
  setupTestEnvironment();

  let formId: string;

  beforeAll(async () => {
    formId = await RecordTestFormHelper.createTestForm();
  });

  afterAll(async () => {
    await RecordTestFormHelper.deleteTestForm(formId);
  });

  it("should return aggregate metadata for a form with no submissions", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getRecordMetadataTool.handler(
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
      },
      context,
    );

    expect(createSnapshotResult(result, formId)).toMatchSnapshot();
  });

  it("should return a zero count for a non-existent form (the metadata endpoint does not validate form existence)", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getRecordMetadataTool.handler(
      {
        formId: "00000000-0000-0000-0000-000000000000",
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
      },
      context,
    );

    // Verified against the real API: unlike search-records, this endpoint does not 404
    // for an unknown formId — it computes an aggregate over zero matching records instead.
    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
