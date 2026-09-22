import { DataSourceTypeTestHelper } from "../setup.js";

describe("DataSourceTypeTestHelper", () => {
  describe("normalizeSettingDefaults", () => {
    it("should replace the defaultValue of a settings entry", () => {
      const input = {
        name: "SQL Database",
        settings: [
          {
            alias: "Connection",
            defaultValue:
              "Server=localhost,1433;Database=FormsMcpDb;User Id=sa;Password=MyStrong!Passw0rd",
            isMandatory: true,
          },
          { alias: "Table", defaultValue: "umbracoLock", isMandatory: true },
        ],
      };

      expect(DataSourceTypeTestHelper.normalizeSettingDefaults(input)).toEqual({
        name: "SQL Database",
        settings: [
          {
            alias: "Connection",
            defaultValue: "NORMALIZED_DEFAULT_VALUE",
            isMandatory: true,
          },
          {
            alias: "Table",
            defaultValue: "NORMALIZED_DEFAULT_VALUE",
            isMandatory: true,
          },
        ],
      });
    });

    it("should normalize an empty default the same way as a populated one", () => {
      // A pristine instance reports "" and a used one reports the last
      // submitted settings — both must normalize to the same value, or the
      // snapshot stays order-dependent.
      const pristine = { alias: "Connection", defaultValue: "" };
      const used = { alias: "Connection", defaultValue: "Server=localhost" };

      expect(DataSourceTypeTestHelper.normalizeSettingDefaults(pristine)).toEqual(
        DataSourceTypeTestHelper.normalizeSettingDefaults(used),
      );
    });

    it("should leave a defaultValue that isn't a settings entry alone", () => {
      const input = { defaultValue: "not a setting" };

      expect(DataSourceTypeTestHelper.normalizeSettingDefaults(input)).toEqual(
        input,
      );
    });

    it("should normalize entries nested at any depth", () => {
      const input = {
        items: [
          { name: "Type", settings: [{ alias: "A", defaultValue: "secret" }] },
        ],
      };

      expect(DataSourceTypeTestHelper.normalizeSettingDefaults(input)).toEqual({
        items: [
          {
            name: "Type",
            settings: [
              { alias: "A", defaultValue: "NORMALIZED_DEFAULT_VALUE" },
            ],
          },
        ],
      });
    });

    it("should leave non-object input untouched", () => {
      expect(DataSourceTypeTestHelper.normalizeSettingDefaults("plain")).toBe(
        "plain",
      );
      expect(DataSourceTypeTestHelper.normalizeSettingDefaults(null)).toBeNull();
    });
  });
});
