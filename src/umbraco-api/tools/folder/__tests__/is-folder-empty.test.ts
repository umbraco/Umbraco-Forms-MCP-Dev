import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FolderBuilder,
} from "./setup.js";
import isFolderEmptyTool from "../get/is-folder-empty.js";

// Suffixed with a random token: Umbraco Forms enforces folder-name uniqueness
// against an index that can retain a name after the folder itself is deleted
// (e.g. following an interrupted test run), so a fixed name can permanently
// collide even when nothing with that name is visible in the tree anymore.
const TEST_NAME = `_Test Is Folder Empty ${Math.random().toString(36).slice(2, 8)}`;

describe("is-folder-empty", () => {
  setupTestEnvironment();

  let builder: FolderBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should report true for a newly created, empty folder", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FolderBuilder().withName(TEST_NAME).create();

    const result = await isFolderEmptyTool.handler({ id: builder.getId() }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  // Verified directly against the live API: getFolderByIdIsEmpty returns a
  // real 200/false for a non-existent folder id rather than a 404 — it
  // doesn't distinguish "this folder has zero children" from "this folder
  // doesn't exist". So `isEmpty: false` here is genuine API behavior, not
  // an unhandled-error bug. (The tool does still check the response status
  // defensively for other non-2xx cases, e.g. a real server error.)
  it("should report false for a non-existent ID (real API behavior)", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await isFolderEmptyTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
