import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import getFormScaffoldByTemplateTool from "../get/get-form-scaffold-by-template.js";

/**
 * KNOWN BLOCKER — escalated, not worked around here.
 *
 * This connected Umbraco Forms instance has no seeded form templates (confirmed by
 * the form-template collection's own list-form-templates.test.ts, which asserts an
 * empty items array rather than a non-empty list). There is no Management API
 * endpoint to create a form template, so a real template name cannot be produced
 * through the API alone — only the error path (an unknown template name) is
 * testable here. Flagging for whoever is coordinating instance changes: seed at
 * least one form template (e.g. "Contact us") to unlock a happy-path test.
 */
describe("get-form-scaffold-by-template", () => {
  setupTestEnvironment();

  it("should return an error for a non-existent template name", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFormScaffoldByTemplateTool.handler(
      { template: "_this-template-does-not-exist_" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
