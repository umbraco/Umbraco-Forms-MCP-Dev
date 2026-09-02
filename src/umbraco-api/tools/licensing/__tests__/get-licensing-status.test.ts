import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getLicensingStatusTool from "../get/get-licensing-status.js";

describe("get-licensing-status", () => {
  setupTestEnvironment();

  it("should return the current licensing status", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getLicensingStatusTool.handler({}, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
