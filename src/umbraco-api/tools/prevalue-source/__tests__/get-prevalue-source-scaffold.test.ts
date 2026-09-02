import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  PrevalueSourceTestHelper,
} from "./setup.js";
import getPrevalueSourceScaffoldTool from "../get/get-prevalue-source-scaffold.js";

describe("get-prevalue-source-scaffold", () => {
  setupTestEnvironment();

  it("should return a blank prevalue source scaffold", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getPrevalueSourceScaffoldTool.handler(context);

    const snapshot = createSnapshotResult(result);
    expect(PrevalueSourceTestHelper.normalizeVolatileFields(snapshot)).toMatchSnapshot();
  });
});
