import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FormTestHelper,
} from "./setup.js";
import getFormScaffoldTool from "../get/get-form-scaffold.js";

describe("get-form-scaffold", () => {
  setupTestEnvironment();

  // ToolDefinition<undefined, ...> — the decorated handler takes only the
  // context, not an ({}, context) pair.
  it("should return a blank form design with generated ids", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFormScaffoldTool.handler(context);

    const normalized = {
      ...result,
      structuredContent: FormTestHelper.normalizeIds(result.structuredContent),
    };

    expect(createSnapshotResult(normalized)).toMatchSnapshot();
  });
});
