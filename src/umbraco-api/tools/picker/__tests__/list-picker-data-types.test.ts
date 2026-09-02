import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import listPickerDataTypesTool from "../get/list-picker-data-types.js";

describe("list-picker-data-types", () => {
  setupTestEnvironment();

  it("should list picker data types", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listPickerDataTypesTool.handler({}, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
