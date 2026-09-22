import {
  setupTestEnvironment,
  PrevalueSourceBuilder,
  PrevalueSourceTestHelper,
} from "../setup.js";

const TEST_NAME = "_Test Prevalue Source Test Helper";

describe("PrevalueSourceTestHelper", () => {
  setupTestEnvironment();

  let builder: PrevalueSourceBuilder | undefined;

  afterEach(async () => {
    if (builder) await builder.delete();
    builder = undefined;
    await PrevalueSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should find a freshly created prevalue source by name", async () => {
    builder = await new PrevalueSourceBuilder().withName(TEST_NAME).create();

    const found = await PrevalueSourceTestHelper.findByName(TEST_NAME);

    expect(found).toBeDefined();
    expect(found?.name).toBe(TEST_NAME);
    expect(found?.id).toBe(builder.getId());
  });

  it("should return undefined for a name that doesn't exist", async () => {
    const found = await PrevalueSourceTestHelper.findByName(
      "_Nonexistent Prevalue Source Name",
    );

    expect(found).toBeUndefined();
  });

  it("should delete every prevalue source matching the name prefix", async () => {
    builder = await new PrevalueSourceBuilder().withName(TEST_NAME).create();

    await PrevalueSourceTestHelper.cleanup(TEST_NAME);

    const found = await PrevalueSourceTestHelper.findByName(TEST_NAME);
    expect(found).toBeUndefined();

    builder = undefined;
  });

  describe("normalizeIds", () => {
    it("should blank every id, recursively", () => {
      const input = {
        id: "3781345e-515f-4001-b646-4dae16e3e8a6",
        name: "Real name",
        nested: { id: "1f3ae040-2913-4918-9d1f-08e91a6000ae", name: "Nested" },
      };

      expect(PrevalueSourceTestHelper.normalizeIds(input)).toEqual({
        id: "00000000-0000-0000-0000-000000000000",
        name: "Real name",
        nested: {
          id: "00000000-0000-0000-0000-000000000000",
          name: "Nested",
        },
      });
    });

    it("should normalize each item of an array", () => {
      const input = [
        { id: "3781345e-515f-4001-b646-4dae16e3e8a6", name: "One" },
        { id: "1f3ae040-2913-4918-9d1f-08e91a6000ae", name: "Two" },
      ];

      expect(PrevalueSourceTestHelper.normalizeIds(input)).toEqual([
        { id: "00000000-0000-0000-0000-000000000000", name: "One" },
        { id: "00000000-0000-0000-0000-000000000000", name: "Two" },
      ]);
    });

    it("should leave non-object input untouched", () => {
      expect(PrevalueSourceTestHelper.normalizeIds("plain")).toBe("plain");
      expect(PrevalueSourceTestHelper.normalizeIds(null)).toBeNull();
    });
  });

  describe("normalizeVolatileFields", () => {
    it("should blank updated and unique, recursively", () => {
      const input = {
        updated: "2025-03-05T10:13:45.456Z",
        unique: "3781345e-515f-4001-b646-4dae16e3e8a6",
        name: "Real name",
        nested: {
          updated: "2025-03-06T11:14:46.789Z",
          unique: "1f3ae040-2913-4918-9d1f-08e91a6000ae",
        },
      };

      expect(PrevalueSourceTestHelper.normalizeVolatileFields(input)).toEqual({
        updated: "NORMALIZED_DATE",
        unique: "00000000-0000-0000-0000-000000000000",
        name: "Real name",
        nested: {
          updated: "NORMALIZED_DATE",
          unique: "00000000-0000-0000-0000-000000000000",
        },
      });
    });

    it("should leave the id field to normalizeIds", () => {
      const input = { id: "3781345e-515f-4001-b646-4dae16e3e8a6" };

      expect(PrevalueSourceTestHelper.normalizeVolatileFields(input)).toEqual(
        input,
      );
    });

    it("should leave non-object input untouched", () => {
      expect(PrevalueSourceTestHelper.normalizeVolatileFields("plain")).toBe(
        "plain",
      );
      expect(PrevalueSourceTestHelper.normalizeVolatileFields(null)).toBeNull();
    });
  });
});
