import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  RecordBuilder,
  RecordTestHelper,
} from "./setup.js";
import executeRecordActionTool from "../post/execute-record-action.js";
import listRecordSetActionsTool from "../get/list-record-set-actions.js";

const TEST_NAME = "_Test Execute Record Action";

describe("execute-record-action", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await RecordTestHelper.cleanup(TEST_NAME);
  });

  it("should execute bulk action on records", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new RecordBuilder()
      .withFormName(TEST_NAME)
      .withFieldValue("Test Value")
      .create();

    // Get available actions
    const actionsResult = await listRecordSetActionsTool.handler({}, context);
    const actionsData = (actionsResult.structuredContent as any)?.items;

    if (!actionsData || !Array.isArray(actionsData) || actionsData.length === 0) {
      throw new Error("No record actions available");
    }

    const firstAction = actionsData[0];

    const result = await executeRecordActionTool.handler(
      {
        formId: builder.getFormId(),
        actionId: firstAction.id,
        recordKeys: [builder.getRecordId()],
      },
      context
    );

    expect(RecordTestHelper.normalizeIds(result)).toMatchSnapshot();
  });

  it("should return error for non-existent action ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await executeRecordActionTool.handler(
      {
        formId: "00000000-0000-0000-0000-000000000000",
        actionId: "00000000-0000-0000-0000-000000000000",
        recordKeys: ["00000000-0000-0000-0000-000000000000"],
      },
      context
    );

    expect(result.isError).toBe(true);
  });
});
