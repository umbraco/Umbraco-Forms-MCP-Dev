import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import refreshPickerDocumentTypeMappingsTool from "../post/refresh-picker-document-type-mappings.js";

// Real document type alias and property id, discovered via
// list-picker-document-types ("contact") and
// get-picker-document-type-properties ("title" property of "contact").
const TEST_DOCUMENT_TYPE_ALIAS = "contact";
const TEST_PROPERTY_ID = "title";

describe("refresh-picker-document-type-mappings", () => {
  setupTestEnvironment();

  it("should refresh property mappings for a document type", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await refreshPickerDocumentTypeMappingsTool.handler(
      {
        doctypeAlias: TEST_DOCUMENT_TYPE_ALIAS,
        currentProperties: [
          {
            id: TEST_PROPERTY_ID,
            value: "Title",
            field: "",
            staticValue: "",
          },
        ],
      },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should return error for a non-existent document type alias", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await refreshPickerDocumentTypeMappingsTool.handler(
      {
        doctypeAlias: "_nonExistentDocumentTypeAlias",
        currentProperties: [],
      },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
