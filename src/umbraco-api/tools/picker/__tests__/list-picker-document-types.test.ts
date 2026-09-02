import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import listPickerDocumentTypesTool from "../get/list-picker-document-types.js";

describe("list-picker-document-types", () => {
  setupTestEnvironment();

  it("should list picker document types", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listPickerDocumentTypesTool.handler({}, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
