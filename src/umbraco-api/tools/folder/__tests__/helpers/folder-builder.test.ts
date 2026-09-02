import {
  setupTestEnvironment,
  FolderBuilder,
  FolderTestHelper,
} from "../setup.js";

const TEST_NAME = "_Test Builder Folder";

describe("FolderBuilder", () => {
  setupTestEnvironment();

  let builder: FolderBuilder;

  afterEach(async () => {
    // Always clean up created folders to prevent conflicts with other test files
    if (builder) await builder.delete();
    await FolderTestHelper.cleanup(TEST_NAME);
  });

  it("should create a folder with the builder", async () => {
    builder = await new FolderBuilder().withName(TEST_NAME).create();

    expect(builder.getId()).toBeDefined();

    const found = await FolderTestHelper.findByName(TEST_NAME);
    expect(found).toBeDefined();
    expect(found?.name).toBe(TEST_NAME);
    expect(found?.id).toBe(builder.getId());
  });
});
