import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getPickerDocumentTypePropertiesTool from "../get/get-picker-document-type-properties.js";

const TEST_DOCUMENT_TYPE_ALIAS = "contact";

describe("get-picker-document-type-properties", () => {
  setupTestEnvironment();

  it("should return properties for a document type alias", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getPickerDocumentTypePropertiesTool.handler(
      { alias: TEST_DOCUMENT_TYPE_ALIAS },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should return error for a non-existent document type alias", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getPickerDocumentTypePropertiesTool.handler(
      { alias: "_nonExistentDocumentTypeAlias" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
