import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  PrevalueSourceTypeTestHelper,
} from "./setup.js";
import listPrevalueSourceTypesTool from "../get/list-prevalue-source-types.js";

describe("list-prevalue-source-types", () => {
  setupTestEnvironment();

  it("should return all available prevalue source types", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listPrevalueSourceTypesTool.handler({}, context);

    expect(
      PrevalueSourceTypeTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });
});
