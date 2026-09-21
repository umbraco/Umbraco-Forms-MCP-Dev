import { setupTestEnvironment, FormBuilder, FormTestHelper } from "../setup.js";

const TEST_NAME = "_Test Form Test Helper";
const TEST_FOLDER_NAME = "_Test Form Test Helper Folder";

describe("FormTestHelper", () => {
  setupTestEnvironment();

  let builder: FormBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should find a freshly created form by name", async () => {
    builder = await new FormBuilder().withName(TEST_NAME).create();

    const found = await FormTestHelper.findByName(TEST_NAME);

    expect(found).toBeDefined();
    expect(found?.name).toBe(TEST_NAME);
    expect(found?.id).toBe(builder.getId());
  });

  it("should return undefined for a name that doesn't exist", async () => {
    const found = await FormTestHelper.findByName("_Nonexistent Form Name");

    expect(found).toBeUndefined();
  });

  it("should delete every form matching the name prefix", async () => {
    builder = await new FormBuilder().withName(TEST_NAME).create();

    await FormTestHelper.cleanup(TEST_NAME);

    const found = await FormTestHelper.findByName(TEST_NAME);
    expect(found).toBeUndefined();

    // The builder's own delete would 404 on an already-deleted form.
    builder = undefined;
  });

  describe("folder helpers", () => {
    let folderId: string | undefined;

    afterEach(async () => {
      if (folderId) await FormTestHelper.deleteFolder(folderId);
      folderId = undefined;
    });

    it("should create a folder and return its id", async () => {
      folderId = await FormTestHelper.createFolder(TEST_FOLDER_NAME);

      expect(folderId).toBeDefined();
      expect(typeof folderId).toBe("string");
    });

    it("should create a child folder under a parent", async () => {
      folderId = await FormTestHelper.createFolder(TEST_FOLDER_NAME);
      const childId = await FormTestHelper.createFolder(
        `${TEST_FOLDER_NAME} Child`,
        folderId,
      );

      expect(childId).toBeDefined();
      expect(childId).not.toBe(folderId);

      await FormTestHelper.deleteFolder(childId);
    });

    it("should ignore deleting a folder that doesn't exist", async () => {
      await expect(
        FormTestHelper.deleteFolder("00000000-0000-0000-0000-000000000000"),
      ).resolves.toBeUndefined();
    });
  });

  describe("normalizeIds", () => {
    it("should blank guid-shaped values, recursively", () => {
      const input = {
        id: "3781345e-515f-4001-b646-4dae16e3e8a6",
        name: "Real name",
        pages: [
          {
            id: "1f3ae040-2913-4918-9d1f-08e91a6000ae",
            caption: "Page 1",
          },
        ],
      };

      expect(FormTestHelper.normalizeIds(input)).toEqual({
        id: "00000000-0000-0000-0000-000000000000",
        name: "Real name",
        pages: [
          {
            id: "00000000-0000-0000-0000-000000000000",
            caption: "Page 1",
          },
        ],
      });
    });

    it("should blank sibling guids on the same object", () => {
      // The shared /g regex is reused across keys in one pass — every sibling
      // must still be replaced, not just the first.
      const input = {
        id: "3781345e-515f-4001-b646-4dae16e3e8a6",
        unique: "1f3ae040-2913-4918-9d1f-08e91a6000ae",
        form: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      };

      expect(FormTestHelper.normalizeIds(input)).toEqual({
        id: "00000000-0000-0000-0000-000000000000",
        unique: "00000000-0000-0000-0000-000000000000",
        form: "00000000-0000-0000-0000-000000000000",
      });
    });

    it("should blank guids embedded inside a larger string", () => {
      const input = { path: "-1,1051,3781345e-515f-4001-b646-4dae16e3e8a6" };

      expect(FormTestHelper.normalizeIds(input)).toEqual({
        path: "-1,1051,00000000-0000-0000-0000-000000000000",
      });
    });

    it("should blank volatile non-guid fields", () => {
      const input = {
        nodeId: 1234,
        created: "2025-03-04T09:12:44.123Z",
        updated: "2025-03-05T10:13:45.456Z",
      };

      expect(FormTestHelper.normalizeIds(input)).toEqual({
        nodeId: 0,
        created: "2000-01-01T00:00:00.000Z",
        updated: "2000-01-01T00:00:00.000Z",
      });
    });

    it("should leave non-object input untouched", () => {
      expect(FormTestHelper.normalizeIds("plain")).toBe("plain");
      expect(FormTestHelper.normalizeIds(null)).toBeNull();
    });
  });
});
