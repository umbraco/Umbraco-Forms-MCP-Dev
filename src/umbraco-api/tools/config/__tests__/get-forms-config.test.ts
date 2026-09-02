import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getFormsConfigTool from "../get/get-forms-config.js";

describe("get-forms-config", () => {
  setupTestEnvironment();

  it("should return the Umbraco Forms back-office configuration", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFormsConfigTool.handler({}, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
