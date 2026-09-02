import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getAcceptanceTestsSystemInfoTool from "../get/get-acceptance-tests-system-info.js";

describe("get-acceptance-tests-system-info", () => {
  setupTestEnvironment();

  it("should return host system information", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getAcceptanceTestsSystemInfoTool.handler({}, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
