import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import exportFormTool from "../get/export-form.js";

/**
 * KNOWN BLOCKER — escalated, not worked around here.
 *
 * export-form downloads a file keyed by a GUID produced by a separate
 * export-preparation step "typically produced ... in the Umbraco backoffice"
 * (per the tool's own description) — there is no Forms Management API
 * endpoint that generates this GUID (confirmed against the full generated
 * client method list: postForm, getForm, ..., getFormExport, postFormImport,
 * ... — no "prepare export" method exists). A real export GUID therefore
 * cannot be produced through the Management API alone, so only the error
 * path (an unknown/never-prepared GUID) is testable here. Flagging for
 * whoever is coordinating instance changes: either expose an export-prepare
 * endpoint, or confirm this tool is only reachable after a backoffice-driven
 * export flow that these API-only integration tests can't perform.
 */
describe("export-form", () => {
  setupTestEnvironment();

  it("should return an error for a GUID that was never prepared for export", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await exportFormTool.handler(
      { guid: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
