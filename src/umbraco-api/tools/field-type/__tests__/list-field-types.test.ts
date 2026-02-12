import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FieldTypeTestHelper,
} from "./setup.js";
import listFieldTypesTool from "../get/list-field-types.js";

describe("list-field-types", () => {
  setupTestEnvironment();

  it("should return all available field types", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listFieldTypesTool.handler({}, context);

    expect(
      FieldTypeTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });
});
