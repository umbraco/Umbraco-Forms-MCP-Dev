import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
} from "./setup.js";
import listFieldTypeValidationPatternsTool from "../get/list-field-type-validation-patterns.js";

describe("list-field-type-validation-patterns", () => {
  setupTestEnvironment();

  it("should return all available validation patterns", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listFieldTypeValidationPatternsTool.handler({}, context);

    expect(result).toMatchSnapshot();
  });
});
