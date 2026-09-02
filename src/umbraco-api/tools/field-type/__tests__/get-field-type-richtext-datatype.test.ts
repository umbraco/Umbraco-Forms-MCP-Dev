import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getFieldTypeRichtextDatatypeTool from "../get/get-field-type-richtext-datatype.js";

describe("get-field-type-richtext-datatype", () => {
  setupTestEnvironment();

  it("should return the data type backing the rich text field type", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFieldTypeRichtextDatatypeTool.handler({}, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
