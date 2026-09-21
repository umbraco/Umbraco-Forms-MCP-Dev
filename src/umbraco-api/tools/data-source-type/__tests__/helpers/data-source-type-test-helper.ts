/**
 * Data Source Type Test Helper
 *
 * Normalizes the one field in a data source type payload that isn't stable:
 * each setting's `defaultValue`.
 *
 * Umbraco Forms persists the settings last submitted for a data source type
 * and serves them back as that type's `defaultValue`. Creating a data source
 * therefore rewrites the defaults reported here — and it does so even when the
 * create is rejected (a POST that fails settings validation with a 400 still
 * updates them). The `data-source` collection's tests run before this one, so
 * on any instance that has run the suite the SQL Database type reports that
 * collection's connection string instead of the empty default a pristine
 * install returns.
 *
 * Snapshotting the raw value would make these tests pass only on a freshly
 * installed instance and would commit a SQL connection string — password
 * included — into a `.snap` file. Normalizing keeps the assertion on the parts
 * that describe the type (aliases, names, views, mandatory flags) and drops the
 * part that describes whoever ran the suite last.
 */

const NORMALIZED_DEFAULT_VALUE = "NORMALIZED_DEFAULT_VALUE";

export class DataSourceTypeTestHelper {
  /**
   * Recursively replaces every settings entry's `defaultValue` with a
   * placeholder. Entries are identified by carrying an `alias` alongside the
   * `defaultValue`, so an unrelated `defaultValue` elsewhere in a payload is
   * left alone.
   */
  static normalizeSettingDefaults(data: unknown): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeSettingDefaults(item));
    }

    if (data && typeof data === "object") {
      const normalized: Record<string, unknown> = {
        ...(data as Record<string, unknown>),
      };

      if ("alias" in normalized && "defaultValue" in normalized) {
        normalized.defaultValue = NORMALIZED_DEFAULT_VALUE;
      }

      for (const key of Object.keys(normalized)) {
        if (normalized[key] && typeof normalized[key] === "object") {
          normalized[key] = this.normalizeSettingDefaults(normalized[key]);
        }
      }

      return normalized;
    }

    return data;
  }
}
