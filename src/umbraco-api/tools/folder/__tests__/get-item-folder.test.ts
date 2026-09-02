import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  validateToolResponse,
  FolderBuilder,
} from "./setup.js";
import getItemFolderTool from "../get/get-item-folder.js";

// Suffixed with a random token: Umbraco Forms enforces folder-name uniqueness
// against an index that can retain a name after the folder itself is deleted
// (e.g. following an interrupted test run), so a fixed name can permanently
// collide even when nothing with that name is visible in the tree anymore.
const RUN_SUFFIX = Math.random().toString(36).slice(2, 8);
const TEST_NAME_1 = `_Test Item Folder 1 ${RUN_SUFFIX}`;
const TEST_NAME_2 = `_Test Item Folder 2 ${RUN_SUFFIX}`;

describe("get-item-folder", () => {
  setupTestEnvironment();

  let builderOne: FolderBuilder;
  let builderTwo: FolderBuilder;

  afterEach(async () => {
    if (builderOne) await builderOne.delete();
    if (builderTwo) await builderTwo.delete();
  });

  it("should look up multiple folders by ID", async () => {
    const context = createMockRequestHandlerExtra();
    builderOne = await new FolderBuilder().withName(TEST_NAME_1).create();
    builderTwo = await new FolderBuilder().withName(TEST_NAME_2).create();

    const result = await getItemFolderTool.handler(
      { ids: [builderOne.getId(), builderTwo.getId()] },
      context,
    );

    const data = validateToolResponse(getItemFolderTool, result);
    expect(data.items).toHaveLength(2);
    expect(data.items.map((item) => item.name).sort()).toEqual(
      [TEST_NAME_1, TEST_NAME_2].sort(),
    );
  });

  it("should return an empty items array when ids is omitted", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getItemFolderTool.handler({ ids: undefined }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
