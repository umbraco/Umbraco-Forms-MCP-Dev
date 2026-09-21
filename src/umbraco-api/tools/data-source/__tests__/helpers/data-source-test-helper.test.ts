import {
  setupTestEnvironment,
  DataSourceBuilder,
  DataSourceTestHelper,
} from "../setup.js";

const TEST_NAME = "_Test Data Source Test Helper";

describe("DataSourceTestHelper", () => {
  setupTestEnvironment();

  let builder: DataSourceBuilder | undefined;

  afterEach(async () => {
    // Always clean up created entities to prevent conflicts with other test files
    if (builder) await builder.delete();
    builder = undefined;
    await DataSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should find a freshly created data source by name", async () => {
    builder = await new DataSourceBuilder().withName(TEST_NAME).create();

    const found = await DataSourceTestHelper.findByName(TEST_NAME);

    expect(found).toBeDefined();
    expect(found?.name).toBe(TEST_NAME);
    expect(found?.id).toBe(builder.getId());
  });

  it("should return undefined for a name that doesn't exist", async () => {
    const found = await DataSourceTestHelper.findByName(
      "_Nonexistent Data Source Name",
    );

    expect(found).toBeUndefined();
  });

  it("should delete every data source matching the name prefix", async () => {
    builder = await new DataSourceBuilder().withName(TEST_NAME).create();

    await DataSourceTestHelper.cleanup(TEST_NAME);

    const found = await DataSourceTestHelper.findByName(TEST_NAME);
    expect(found).toBeUndefined();

    builder = undefined;
  });

  describe("normalizeIds", () => {
    it("should blank id, unique and updated, recursively", () => {
      const input = {
        id: "3781345e-515f-4001-b646-4dae16e3e8a6",
        unique: "1f3ae040-2913-4918-9d1f-08e91a6000ae",
        updated: "2025-03-05T10:13:45.456Z",
        name: "Real name",
        nested: {
          id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          name: "Nested",
        },
      };

      expect(DataSourceTestHelper.normalizeIds(input)).toEqual({
        id: "00000000-0000-0000-0000-000000000000",
        unique: "00000000-0000-0000-0000-000000000000",
        updated: "NORMALIZED_DATE",
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

      expect(DataSourceTestHelper.normalizeIds(input)).toEqual([
        { id: "00000000-0000-0000-0000-000000000000", name: "One" },
        { id: "00000000-0000-0000-0000-000000000000", name: "Two" },
      ]);
    });

    it("should leave non-object input untouched", () => {
      expect(DataSourceTestHelper.normalizeIds("plain")).toBe("plain");
      expect(DataSourceTestHelper.normalizeIds(null)).toBeNull();
    });
  });

  describe("redactSettings", () => {
    it("should redact settings values while keeping their keys", () => {
      const input = {
        name: "Real name",
        settings: {
          connectionString: "Server=.;Database=Umbraco;Password=hunter2",
          tableName: "Contacts",
        },
      };

      expect(DataSourceTestHelper.redactSettings(input)).toEqual({
        name: "Real name",
        settings: {
          connectionString: "**redacted**",
          tableName: "**redacted**",
        },
      });
    });

    it("should redact settings nested inside arrays", () => {
      const input = [{ settings: { connectionString: "secret" } }];

      expect(DataSourceTestHelper.redactSettings(input)).toEqual([
        { settings: { connectionString: "**redacted**" } },
      ]);
    });

    it("should leave objects without settings untouched", () => {
      const input = { name: "Real name", nested: { name: "Nested" } };

      expect(DataSourceTestHelper.redactSettings(input)).toEqual(input);
    });
  });
});
