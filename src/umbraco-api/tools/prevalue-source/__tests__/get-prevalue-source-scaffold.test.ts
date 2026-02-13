import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  PrevalueSourceTestHelper,
} from "./setup.js";
import getPrevalueSourceScaffoldTool from "../get/get-prevalue-source-scaffold.js";

describe("get-prevalue-source-scaffold", () => {
  setupTestEnvironment();

  it("should return prevalue source scaffold", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getPrevalueSourceScaffoldTool.handler({}, context);

    expect(
      PrevalueSourceTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });
});
