/**
 * Schema drift alarm for the hardcoded constants in `tools/form/shared/`.
 *
 * `form-field-types.ts` and `form-design-keys.ts` are a copy of Umbraco Forms'
 * schema frozen at the time they were written: 16 field-type GUIDs and the list
 * of `FormDesign` properties the tools backfill on the caller's behalf. Nothing
 * in the type system ties them to the Forms instance they describe, so when
 * Forms adds a required property, renames one, or changes a field type, the
 * constants keep compiling and the tools start producing payloads the server
 * rejects — or, worse, quietly demand boilerplate from the caller again.
 *
 * These tests fail the moment that happens, and name what drifted. They run
 * against the connected instance and against the Orval-generated schema, which
 * between them are the two things that actually know the current shape.
 *
 * A failure here is not necessarily a bug in this repo — it usually means Forms
 * changed and a constant needs updating. The message tells you which.
 */

import { setupTestEnvironment, FormTestHelper } from "./setup.js";
import {
  CAPTURE_RAW_HTTP_RESPONSE,
  type HttpResponse,
} from "@umbraco-cms/mcp-server-sdk";
import {
  getUmbracoFormsManagementAPI,
  type FieldTypeWithSettings,
} from "../../../api/generated/umbracoFormsManagementApi.js";
import { postFormBody } from "../../../api/generated/umbracoFormsManagementApi.zod.js";
import {
  FORMS_FIELD_TYPE_IDS,
  FIELD_TYPE_ALIASES,
} from "../shared/form-field-types.js";
import { SERVER_DERIVABLE_FORM_KEYS } from "../shared/form-design-keys.js";
import {
  buildFormDesign,
  withFormDesignDefaults,
  type SimpleFormSpec,
} from "../shared/build-form-design.js";

/**
 * The only two `FormDesign` properties a caller is expected to supply. Every
 * other required property must be covered by SERVER_DERIVABLE_FORM_KEYS.
 */
const CALLER_SUPPLIED_KEYS = ["name", "pages"];

/**
 * Fails with a message naming exactly what drifted and what to do about it.
 *
 * A bare `expect(list).toEqual([])` reports the diff but not the remedy, and
 * the remedy is the whole point: whoever sees this failure is usually looking
 * at a Forms upgrade, not at a bug in their own change.
 */
function assertNoDrift(drifted: string[], guidance: string): void {
  if (drifted.length > 0) {
    throw new Error(`${guidance}\n  - ${drifted.join("\n  - ")}`);
  }
  expect(drifted).toEqual([]);
}

describe("shared schema contract", () => {
  setupTestEnvironment();

  describe("FORMS_FIELD_TYPE_IDS vs the connected instance", () => {
    let liveFieldTypes: FieldTypeWithSettings[];

    beforeAll(async () => {
      const client = getUmbracoFormsManagementAPI();
      liveFieldTypes = (await client.getFieldType()) as unknown as FieldTypeWithSettings[];
    });

    it("should expose at least one field type to compare against", () => {
      expect(Array.isArray(liveFieldTypes)).toBe(true);
      expect(liveFieldTypes.length).toBeGreaterThan(0);
    });

    it("should still ship every hardcoded field type id", () => {
      const liveIds = new Set(liveFieldTypes.map((type) => type.id.toLowerCase()));

      const missing = Object.entries(FORMS_FIELD_TYPE_IDS)
        .filter(([, id]) => !liveIds.has(id.toLowerCase()))
        .map(([name, id]) => `${name} (${id})`);

      assertNoDrift(
        missing,
        "FORMS_FIELD_TYPE_IDS names field types this Umbraco Forms instance does not ship. Update src/umbraco-api/tools/form/shared/form-field-types.ts:",
      );
    });

    it("should resolve every friendly alias to a real field type", () => {
      const liveIds = new Set(liveFieldTypes.map((type) => type.id.toLowerCase()));

      const broken = Object.entries(FIELD_TYPE_ALIASES)
        .filter(([, mapping]) => !liveIds.has(mapping.fieldTypeId.toLowerCase()))
        .map(([alias, mapping]) => `${alias} -> ${mapping.fieldTypeId}`);

      assertNoDrift(
        broken,
        "FIELD_TYPE_ALIASES maps an alias onto a field type this instance does not have:",
      );
    });

    it("should report any built-in field type the aliases do not cover", () => {
      // Informational rather than fatal: a site's custom field types legitimately
      // have no alias. This only records what create-simple-form cannot reach, so
      // a newly shipped built-in type is visible in the diff when Forms adds one.
      const mappedIds = new Set(
        Object.values(FIELD_TYPE_ALIASES).map((mapping) =>
          mapping.fieldTypeId.toLowerCase(),
        ),
      );

      const uncovered = liveFieldTypes
        .filter((type) => !mappedIds.has(type.id.toLowerCase()))
        .map((type) => type.name)
        .sort();

      expect(uncovered).toMatchSnapshot("field types without a friendly alias");
    });
  });

  describe("SERVER_DERIVABLE_FORM_KEYS vs the generated FormDesign schema", () => {
    it("should only name keys the schema actually has", () => {
      // makeOptional skips a key it cannot find, so a renamed or removed
      // property silently stops being relaxed and becomes required for the
      // caller again — with no error anywhere.
      const shapeKeys = new Set(Object.keys(postFormBody.shape));

      const unknown = SERVER_DERIVABLE_FORM_KEYS.filter(
        (key) => !shapeKeys.has(key),
      );

      assertNoDrift(
        unknown,
        "SERVER_DERIVABLE_FORM_KEYS names properties FormDesign no longer has. makeOptional ignores an unknown key silently, so create-form would start requiring these from the caller:",
      );
    });

    it("should cover every required property except name and pages", () => {
      // If Forms marks a new property required and it isn't listed here,
      // create-form starts demanding boilerplate the caller cannot know.
      const required = Object.entries(postFormBody.shape)
        .filter(([, schema]) => !(schema as any).safeParse(undefined).success)
        .map(([key]) => key);

      const covered = new Set<string>([
        ...SERVER_DERIVABLE_FORM_KEYS,
        ...CALLER_SUPPLIED_KEYS,
      ]);

      const uncovered = required.filter((key) => !covered.has(key));

      assertNoDrift(
        uncovered,
        "FormDesign has required properties that are neither caller-supplied nor backfilled. Add each to SERVER_DERIVABLE_FORM_KEYS with a default in formDesignDefaults, or treat it as caller-supplied:",
      );
    });
  });

  describe("generated designs against the live API", () => {
    const TEST_NAME = "_Test Schema Contract";

    afterEach(async () => {
      await FormTestHelper.cleanup(TEST_NAME);
    });

    it("should accept a design built from every friendly alias", async () => {
      // The strongest statement available: whatever the hardcoded settings,
      // GUIDs and defaults expand to, the real server takes it. If Forms
      // changes what a field type requires, this fails with the server's own
      // validation message rather than at some later runtime.
      // create-simple-form casts the same way: SimpleFormSpec is a mapped type
      // over the Zod shape, so every key is present even though each is optional.
      const design = buildFormDesign({
        name: TEST_NAME,
        fields: Object.keys(FIELD_TYPE_ALIASES).map((type) => ({
          label: `Field ${type}`,
          type,
          // Every list-style alias needs options; supplying them for the rest
          // is harmless and keeps the spec uniform.
          options: ["One", "Two"],
        })),
      } as unknown as SimpleFormSpec);

      const client = getUmbracoFormsManagementAPI();
      const response = (await client.postForm(
        design,
        CAPTURE_RAW_HTTP_RESPONSE,
      )) as unknown as HttpResponse<unknown>;

      if (response.status < 200 || response.status >= 300) {
        throw new Error(
          `POST /form rejected a design built by buildFormDesign - a hardcoded setting or field type no longer satisfies Forms: HTTP ${response.status} ${JSON.stringify(response.data)}`,
        );
      }
      expect(response.status).toBeLessThan(300);
    });

    it("should accept a minimal design backfilled by withFormDesignDefaults", async () => {
      // create-form's path: only name and pages supplied, everything else
      // backfilled. Proves the backfill still satisfies the server's required
      // properties.
      const minimal = withFormDesignDefaults({
        name: TEST_NAME,
        pages: [
          {
            fieldSets: [
              {
                containers: [
                  {
                    fields: [
                      {
                        caption: "Your name",
                        fieldTypeId: FORMS_FIELD_TYPE_IDS.shortAnswer,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      } as any);

      const client = getUmbracoFormsManagementAPI();
      const response = (await client.postForm(
        minimal as any,
        CAPTURE_RAW_HTTP_RESPONSE,
      )) as unknown as HttpResponse<unknown>;

      if (response.status < 200 || response.status >= 300) {
        throw new Error(
          `POST /form rejected a minimal design backfilled by withFormDesignDefaults - the backfill no longer satisfies Forms' required properties: HTTP ${response.status} ${JSON.stringify(response.data)}`,
        );
      }
      expect(response.status).toBeLessThan(300);
    });
  });
});
