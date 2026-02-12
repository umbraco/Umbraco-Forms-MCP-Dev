import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FolderBuilder,
} from "./setup.js";
import deleteFolderTool from "../delete/delete-folder.js";

const TEST_NAME = "_Test Delete Folder";

describe("delete-folder", () => {
  setupTestEnvironment();

  it("should delete a folder", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FolderBuilder().withName(TEST_NAME).create();

    const result = await deleteFolderTool.handler(
      { id: builder.getId() },
      context
    );

    expect(result.isError).toBeUndefined();
  });

  it("should return error for non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteFolderTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context
    );

    expect(result.isError).toBe(true);
  });
});
