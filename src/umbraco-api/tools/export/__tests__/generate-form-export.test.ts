import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  ExportTestFormHelper,
} from "./setup.js";
import generateFormExportTool from "../post/generate-form-export.js";

const TEST_EXPORT_TYPE = "csvSubmittedValues";

/**
 * KNOWN BLOCKER — escalated, not worked around here.
 *
 * The underlying Umbraco Forms export endpoint (`POST .../form/export`) returns an
 * unhandled 500 with an empty body for any form that has zero submitted records.
 * Confirmed with a raw client call across both available export type aliases
 * (csvSubmittedValues, csvDisplayValues) and every documented filter/sort/skip/take
 * combination — always 500, never a clean "no records" response.
 *
 * The Forms Management API exposes no endpoint to create a form record — submission
 * happens through a separate, public-facing Forms front-end API that isn't part of
 * this collection or reachable from these tests — so a form with real submitted
 * records cannot be produced through the Management API alone. This instance also has
 * no other forms with existing submissions to fall back on (`getForm` returns `[]`).
 *
 * The "happy path" test below therefore documents the current, real (non-mocked) 500
 * response rather than fabricating a success. Flagging for whoever is coordinating
 * instance changes: either seed a form with real submitted records, or treat the 500
 * on an empty form as a product bug to fix/report upstream.
 */
describe("generate-form-export", () => {
  setupTestEnvironment();

  let formId: string;

  beforeAll(async () => {
    formId = await ExportTestFormHelper.createTestForm();
  });

  afterAll(async () => {
    await ExportTestFormHelper.deleteTestForm(formId);
  });

  it("documents the current server response when generating an export for a form with no submitted records (see blocker comment above)", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await generateFormExportTool.handler(
      {
        formId,
        exportType: TEST_EXPORT_TYPE,
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

  it("should return error for a non-existent form", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await generateFormExportTool.handler(
      {
        formId: "00000000-0000-0000-0000-000000000000",
        exportType: TEST_EXPORT_TYPE,
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
