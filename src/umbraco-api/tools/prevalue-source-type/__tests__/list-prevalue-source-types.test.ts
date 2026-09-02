import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import listPrevalueSourceTypesTool from "../get/list-prevalue-source-types.js";

describe("list-prevalue-source-types", () => {
  setupTestEnvironment();

  it("should list built-in prevalue source types", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listPrevalueSourceTypesTool.handler({}, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
