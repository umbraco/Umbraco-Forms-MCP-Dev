import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FolderBuilder,
} from "./setup.js";
import deleteFolderTool from "../delete/delete-folder.js";
import getFolderByIdTool from "../get/get-folder-by-id.js";
import { purgeFolder } from "../../../../testing/purge.js";

const TEST_NAME = "_Test Delete Folder";

describe("delete-folder", () => {
  setupTestEnvironment();

  it("should delete an existing folder", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FolderBuilder().withName(TEST_NAME).create();
    const id = builder.getId();

    const result = await deleteFolderTool.handler({ id }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();

    // Forms 17.6 / 18.2 move a deleted folder to the recycle bin rather than removing it.
    const getResult = await getFolderByIdTool.handler({ id }, context);
    expect(getResult.structuredContent).toMatchObject({ trashed: true });

    await purgeFolder(id);
  });

  it("should return an error for a non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteFolderTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
