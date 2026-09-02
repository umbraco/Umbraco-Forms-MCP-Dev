import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import listFieldTypesTool from "../get/list-field-types.js";

describe("list-field-types", () => {
  setupTestEnvironment();

  it("should list built-in field types", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listFieldTypesTool.handler({}, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
