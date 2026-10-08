import { setupTestEnvironment, createMockRequestHandlerExtra, RecordTestFormHelper } from "./setup.js";
import executeRecordActionTool from "../post/execute-record-action.js";
import getRecordSetActionsTool from "../get/get-record-set-actions.js";
import { RecordEntryHelper } from "./helpers/record-entry-helper.js";

describe("execute-record-action", () => {
  setupTestEnvironment();

  let formId: string;
  let actionId: string;
  let actions: Array<{ id: string; alias: string }>;

  beforeAll(async () => {
    formId = await RecordTestFormHelper.createTestForm();

    const context = createMockRequestHandlerExtra();
    // Uses (context, context) — see the doc comment in get-record-set-actions.test.ts for
    // why this tool's decorated handler requires that call shape.
    const actionsResult = await getRecordSetActionsTool.handler(context, context);
    actions = (actionsResult.structuredContent as { items: Array<{ id: string; alias: string }> })?.items ?? [];
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

  it.each([
    ["approve", "Approved"],
    ["reject", "Rejected"],
  ])("should %s an entry", async (alias, state) => {
    const context = createMockRequestHandlerExtra();
    const [fieldId] = await RecordTestFormHelper.getFieldIds(formId);
    // create-record stores the entry as Submitted, so the action has something to change.
    const recordId = await RecordEntryHelper.createEntry(formId, fieldId, "true");
    const action = actions.find((candidate) => candidate.alias === alias)!;

    const result = await executeRecordActionTool.handler({ formId, actionId: action.id, recordKeys: [recordId] }, context);

    expect(result.isError).toBeFalsy();
    expect((await RecordEntryHelper.getEntry(formId, recordId))?.state).toBe(state);
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
