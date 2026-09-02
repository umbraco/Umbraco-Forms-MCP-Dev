import { setupTestEnvironment, createMockRequestHandlerExtra } from "./setup.js";
import importFormTool from "../post/import-form.js";

/**
 * KNOWN BLOCKER — escalated, not worked around here.
 *
 * import-form requires the fileKey of an already-uploaded .uform export file
 * (per the tool's own description, "uploading the file itself is not part of
 * this API"). There is no Forms Management API endpoint in this collection
 * (or any other available to these tests) that uploads a file and returns a
 * fileKey, so a real import cannot be exercised through the API alone — only
 * the error path (an unknown fileKey) is testable here. Flagging for whoever
 * is coordinating instance changes: either expose/identify the upload
 * endpoint that produces a fileKey, or confirm this tool is only reachable
 * after a backoffice-driven file upload that these API-only integration
 * tests can't perform.
 */
describe("import-form", () => {
  setupTestEnvironment();

  it("should return an error for a fileKey that was never uploaded", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await importFormTool.handler(
      { fileKey: "00000000-0000-0000-0000-000000000000", folderId: undefined },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
