import {
  setupTestEnvironment,
  FolderBuilder,
  FolderTestHelper,
} from "../setup.js";

const TEST_NAME = "_Test Folder Test Helper";
const CHILD_NAME = `${TEST_NAME} Child`;

describe("FolderTestHelper", () => {
  setupTestEnvironment();

  let builder: FolderBuilder | undefined;

  afterEach(async () => {
    // Always clean up created folders to prevent conflicts with other test files
    if (builder) await builder.delete();
    builder = undefined;
    await FolderTestHelper.cleanup(TEST_NAME);
  });

  it("should find a freshly created folder at the tree root", async () => {
    builder = await new FolderBuilder().withName(TEST_NAME).create();

    const found = await FolderTestHelper.findByName(TEST_NAME);

    expect(found).toBeDefined();
    expect(found?.name).toBe(TEST_NAME);
    expect(found?.id).toBe(builder.getId());
    expect(found?.isFolder).toBe(true);
  });

  it("should find a child folder under the given parent", async () => {
    builder = await new FolderBuilder().withName(TEST_NAME).create();
    const child = await new FolderBuilder()
      .withName(CHILD_NAME)
      .withParentId(builder.getId())
      .create();

    const found = await FolderTestHelper.findByName(CHILD_NAME, builder.getId());

    expect(found).toBeDefined();
    expect(found?.id).toBe(child.getId());

    // The child is not at the root, so a root-scoped search must miss it.
    const atRoot = await FolderTestHelper.findByName(CHILD_NAME);
    expect(atRoot).toBeUndefined();
  });

  it("should return undefined for a name that doesn't exist", async () => {
    const found = await FolderTestHelper.findByName("_Nonexistent Folder Name");

    expect(found).toBeUndefined();
  });

  it("should delete matching folders and their descendants", async () => {
    builder = await new FolderBuilder().withName(TEST_NAME).create();
    const parentId = builder.getId();
    await new FolderBuilder()
      .withName(CHILD_NAME)
      .withParentId(parentId)
      .create();

    await FolderTestHelper.cleanup(TEST_NAME);

    expect(await FolderTestHelper.findByName(TEST_NAME)).toBeUndefined();

    // The parent is gone, so the child can no longer be reached either.
    builder = undefined;
  });

  describe("normalizeIds", () => {
    it("should blank id and parentId, recursively", () => {
      const input = {
        id: "3781345e-515f-4001-b646-4dae16e3e8a6",
        name: "Real name",
        parentId: "1f3ae040-2913-4918-9d1f-08e91a6000ae",
        children: [
          {
            id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            name: "Child",
            parentId: "3781345e-515f-4001-b646-4dae16e3e8a6",
          },
        ],
      };

      expect(FolderTestHelper.normalizeIds(input)).toEqual({
        id: "00000000-0000-0000-0000-000000000000",
        name: "Real name",
        parentId: "00000000-0000-0000-0000-000000000000",
        children: [
          {
            id: "00000000-0000-0000-0000-000000000000",
            name: "Child",
            parentId: "00000000-0000-0000-0000-000000000000",
          },
        ],
      });
    });

    it("should leave objects without ids untouched", () => {
      const input = { name: "Real name", hasChildren: false };

      expect(FolderTestHelper.normalizeIds(input)).toEqual(input);
    });

    it("should leave non-object input untouched", () => {
      expect(FolderTestHelper.normalizeIds("plain")).toBe("plain");
      expect(FolderTestHelper.normalizeIds(null)).toBeNull();
    });
  });
});
