import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  validateToolResponse,
} from "./setup.js";
import createFolderTool from "../post/create-folder.js";
import { purgeFolder } from "../../../../testing/purge.js";

const TEST_NAME = "_Test Create Folder";

describe("create-folder", () => {
  setupTestEnvironment();

  let createdId: string | undefined;

  afterEach(async () => {
    if (createdId) {
      await purgeFolder(createdId);
      createdId = undefined;
    }
  });

  it("should create a folder at the root", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createFolderTool.handler(
      { name: TEST_NAME, parentId: undefined },
      context,
    );

    const data = validateToolResponse(createFolderTool, result);
    expect(data.success).toBe(true);
    createdId = data.id;

    expect(createSnapshotResult(result, data.id)).toMatchSnapshot();
  });

  it("should report failure for a non-existent parentId", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createFolderTool.handler(
      { name: TEST_NAME, parentId: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    const data = validateToolResponse(createFolderTool, result);
    expect(data.success).toBe(false);
  });
});
