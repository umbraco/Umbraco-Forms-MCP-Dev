import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import listThemesTool from "../get/list-themes.js";

describe("list-themes", () => {
  setupTestEnvironment();

  it("should list available themes", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listThemesTool.handler({}, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
