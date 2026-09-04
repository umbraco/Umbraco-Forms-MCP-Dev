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

    // FormTestHelper.normalizeIds blanket-replaces every GUID-shaped string with
    // the same placeholder, so it can't tell a correct cross-reference from a
    // stale default — assert the real relationships before normalizing for the
    // snapshot below.
    const design = result.structuredContent as {
      id: string;
      pages: Array<{ id: string; form: string; fieldSets: Array<{ page: string }> }>;
    };
    for (const page of design.pages) {
      expect(page.form).toBe(design.id);
      for (const fieldSet of page.fieldSets) {
        expect(fieldSet.page).toBe(page.id);
      }
    }

    const normalized = {
      ...result,
      structuredContent: FormTestHelper.normalizeIds(result.structuredContent),
    };

    expect(createSnapshotResult(normalized)).toMatchSnapshot();
  });
});
