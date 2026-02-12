import {
  setupTestEnvironment,
  FolderBuilder,
  FolderTestHelper,
} from "../setup.js";

const TEST_NAME = "_Test Builder Folder";

describe("FolderBuilder", () => {
  setupTestEnvironment();

  const createdIds: string[] = [];

  afterEach(async () => {
    for (const id of createdIds) {
      await FolderTestHelper.deleteById(id);
    }
    createdIds.length = 0;
  });

  it("should create folder with builder", async () => {
    const builder = await new FolderBuilder()
      .withName(TEST_NAME)
      .create();

    const id = builder.getId();
    createdIds.push(id);

    expect(id).toBeDefined();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it("should create folder with parent", async () => {
    const parentBuilder = await new FolderBuilder()
      .withName(TEST_NAME + " Parent")
      .create();

    const parentId = parentBuilder.getId();
    createdIds.push(parentId);

    const childBuilder = await new FolderBuilder()
      .withName(TEST_NAME + " Child")
      .withParentId(parentId)
      .create();

    const childId = childBuilder.getId();
    createdIds.push(childId);

    expect(childId).toBeDefined();
    expect(childId).not.toBe(parentId);
  });
});
