import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import listRecordSetActionsTool from "../get/list-record-set-actions.js";

describe("list-record-set-actions", () => {
  setupTestEnvironment();

  it("should return all available bulk actions", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listRecordSetActionsTool.handler({}, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
