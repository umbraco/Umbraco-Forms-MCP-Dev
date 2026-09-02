import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getUpdatesVersionTool from "../get/get-updates-version.js";

describe("get-updates-version", () => {
  setupTestEnvironment();

  it("should return the latest available Umbraco Forms version", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getUpdatesVersionTool.handler({}, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
