import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  RecordTestFormHelper,
} from "./setup.js";
import searchRecordsTool from "../get/search-records.js";

/**
 * This Umbraco instance has no forms with real submitted records (records can only be
 * created through Umbraco Forms' public front-end submission flow, not the Management
 * API this MCP wraps — see the record-test-form-helper.ts doc comment). The happy-path
 * test below therefore exercises the real search flow against a real, empty form: an
 * empty result page is a genuine, valid response for search-records, not a fabricated one.
 */
describe("search-records", () => {
  setupTestEnvironment();

  let formId: string;

  beforeAll(async () => {
    formId = await RecordTestFormHelper.createTestForm();
  });

  afterAll(async () => {
    await RecordTestFormHelper.deleteTestForm(formId);
  });

  it("should search records for a form with no submissions", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await searchRecordsTool.handler(
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

    // The schema's "dataConsent" entry has a freshly server-generated GUID `id` on every
    // scaffolded form — normalize it before snapshotting (see normalizeSchemaIds doc comment).
    expect(RecordTestFormHelper.normalizeSchemaIds(createSnapshotResult(result, formId))).toMatchSnapshot();
  });

  it("should return error for a non-existent form", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await searchRecordsTool.handler(
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

    expect(result.isError).toBe(true);
  });
});
