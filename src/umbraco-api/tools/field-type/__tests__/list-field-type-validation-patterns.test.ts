import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import listFieldTypeValidationPatternsTool from "../get/list-field-type-validation-patterns.js";

describe("list-field-type-validation-patterns", () => {
  setupTestEnvironment();

  it("should list built-in validation patterns", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listFieldTypeValidationPatternsTool.handler({}, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
