import { setupTestEnvironment, createMockRequestHandlerExtra, RecordTestFormHelper } from "./setup.js";
import executeRecordActionTool from "../post/execute-record-action.js";
import getRecordSetActionsTool from "../get/get-record-set-actions.js";

/**
 * NO HAPPY-PATH COVERAGE OF AN ACTUAL RECORD CHANGE — genuine gap, not worked around here.
 *
 * execute-record-action is destructive (approve/reject/delete), so per the task scope it
 * must only ever be run against records created for that purpose — never against
 * real/unknown existing data. This instance has no forms with real submitted records and
 * no Management API endpoint exists to create one (see get-record-audit-trail.test.ts),
 * so there is no record we could safely create and then act on/verify the effect of. The
 * tests below fetch a real actionId from get-record-set-actions (actionId is a GUID per
 * the API schema — the "approve"/"reject" names are just aliases) and run it against a
 * real, empty form, documenting the tool's real (verified, non-fabricated) behavior for
 * both an unknown record and an unknown form, without touching any real record.
 */
describe("execute-record-action", () => {
  setupTestEnvironment();

  let formId: string;
  let actionId: string;

  beforeAll(async () => {
    formId = await RecordTestFormHelper.createTestForm();

    const context = createMockRequestHandlerExtra();
    // Uses (context, context) — see the doc comment in get-record-set-actions.test.ts for
    // why this tool's decorated handler requires that call shape.
    const actionsResult = await getRecordSetActionsTool.handler(context, context);
    const actions = (actionsResult.structuredContent as { items: Array<{ id: string }> })?.items ?? [];
    if (actions.length === 0) {
      throw new Error(
        "get-record-set-actions returned no actions — cannot determine a real actionId to test execute-record-action against.",
      );
    }
    actionId = actions[0].id;
  });

  afterAll(async () => {
    await RecordTestFormHelper.deleteTestForm(formId);
  });

  it("should not error when running an action against a record that doesn't exist (verified real, no-op behavior)", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await executeRecordActionTool.handler(
      {
        formId,
        actionId,
        recordKeys: ["00000000-0000-0000-0000-000000000001"],
      },
      context,
    );

    // Verified against the real API: the record-set action endpoint doesn't validate
    // that recordKeys actually exist — it just runs (as a no-op against zero matching
    // records) and returns a void success, rather than 404ing on the unknown key.
    expect(result.isError).toBeFalsy();
  });

  it("should return error for a non-existent form", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await executeRecordActionTool.handler(
      {
        formId: "00000000-0000-0000-0000-000000000000",
        actionId,
        recordKeys: ["00000000-0000-0000-0000-000000000001"],
      },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
