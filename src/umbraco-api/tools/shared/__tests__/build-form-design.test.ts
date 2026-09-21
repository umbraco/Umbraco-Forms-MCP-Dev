/**
 * Unit tests for the compact-spec expander.
 *
 * `buildFormDesign` turns a handful of fields into a ~10KB FormDesign in which
 * almost every value is hardcoded here rather than fetched from Forms. The
 * snapshot pins that whole payload so an accidental change to a default,
 * setting name or nesting level shows up as a diff; the assertions around it
 * cover the decisions the snapshot can't express — alias derivation, option
 * normalization and the error paths.
 *
 * Whether those hardcoded values still satisfy Forms is a separate question,
 * answered by schema-contract.test.ts against a live instance.
 */

import { randomUUID } from "node:crypto";
import {
  buildFormDesign,
  buildField,
  formDesignDefaults,
  withFormDesignDefaults,
  simpleFieldSchema,
  type SimpleFieldSpec,
  type SimpleFormSpec,
} from "../build-form-design.js";
import { FORMS_FIELD_TYPE_IDS } from "../form-field-types.js";
import { FormTestHelper } from "../../form/__tests__/helpers/form-test-helper.js";

const spec = (partial: Record<string, unknown>) =>
  partial as unknown as SimpleFormSpec;

const field = (partial: Record<string, unknown>) =>
  partial as unknown as SimpleFieldSpec;

describe("buildFormDesign", () => {
  it("should expand a representative spec into a full design", () => {
    const design = buildFormDesign(
      spec({
        name: "Contact us",
        pageCaption: "Get in touch",
        fields: [
          { label: "Your name", type: "text", required: true, group: "About you" },
          { label: "Email address", type: "email", required: true, group: "About you" },
          { label: "How did you hear about us?", type: "dropdown", options: ["Search", { value: "friend", caption: "A friend" }] },
          { label: "Message", type: "textarea", rows: 5, maxLength: 500 },
          { label: "I agree to the terms", type: "consent", required: true },
        ],
      }),
    );

    // GUIDs are freshly generated per call, so blank them before snapshotting.
    expect(FormTestHelper.normalizeIds(design)).toMatchSnapshot();
  });

  it("should group consecutive fields sharing a group into one fieldset", () => {
    const design = buildFormDesign(
      spec({
        name: "Grouped",
        fields: [
          { label: "A", type: "text", group: "One" },
          { label: "B", type: "text", group: "One" },
          { label: "C", type: "text", group: "Two" },
        ],
      }),
    );

    const fieldSets = (design.pages as any)[0].fieldSets;
    expect(fieldSets).toHaveLength(2);
    expect(fieldSets[0].caption).toBe("One");
    expect(fieldSets[0].containers[0].fields).toHaveLength(2);
    expect(fieldSets[1].caption).toBe("Two");
  });

  it("should start a new fieldset when a group name repeats later", () => {
    // Documented behaviour: grouping follows the given order rather than
    // reordering fields to merge same-named groups.
    const design = buildFormDesign(
      spec({
        name: "Repeated",
        fields: [
          { label: "A", type: "text", group: "One" },
          { label: "B", type: "text", group: "Two" },
          { label: "C", type: "text", group: "One" },
        ],
      }),
    );

    const fieldSets = (design.pages as any)[0].fieldSets;
    expect(fieldSets.map((f: any) => f.caption)).toEqual(["One", "Two", "One"]);
  });

  it("should use the supplied id rather than generating one", () => {
    const id = randomUUID();

    const design = buildFormDesign(spec({ id, name: "Fixed", fields: [{ label: "A", type: "text" }] }));

    expect(design.id).toBe(id);
  });
});

describe("buildField", () => {
  it("should reject an unknown field type with the accepted list", () => {
    expect(() => buildField(field({ label: "A", type: "notAType" }), new Set())).toThrow(
      /Unknown field type 'notAType'\. Expected one of: /,
    );
  });

  describe("alias derivation", () => {
    const aliasFor = (label: string, taken = new Set<string>()) =>
      (buildField(field({ label, type: "text" }), taken) as any).alias;

    it("should camelCase a multi-word label", () => {
      expect(aliasFor("Email address")).toBe("emailAddress");
    });

    it("should drop punctuation", () => {
      expect(aliasFor("What is your name?")).toBe("whatIsYourName");
    });

    it("should prefix a label starting with a digit", () => {
      // An alias must not start with a digit.
      expect(aliasFor("1st line of address")).toBe("field1stLineOfAddress");
    });

    it("should fall back to 'field' when nothing survives normalization", () => {
      expect(aliasFor("!!!")).toBe("field");
    });

    it("should suffix a colliding alias rather than overwrite it", () => {
      const taken = new Set<string>();
      expect(aliasFor("Name", taken)).toBe("name");
      expect(aliasFor("Name", taken)).toBe("name2");
      expect(aliasFor("Name", taken)).toBe("name3");
    });

    it("should prefer an explicitly supplied alias", () => {
      const built = buildField(field({ label: "Your name", type: "text", alias: "customAlias" }), new Set());
      expect((built as any).alias).toBe("customAlias");
    });

    it("should keep non-Latin labels rather than emptying them", () => {
      // \p{L} matches any letter, so Danish characters survive.
      expect(aliasFor("Køn")).toBe("køn");
    });
  });

  describe("options", () => {
    it("should accept plain strings and {value, caption} alike", () => {
      const built = buildField(
        field({ label: "Choice", type: "dropdown", options: ["Yes", { value: "n", caption: "No" }] }),
        new Set(),
      );

      expect((built as any).preValues).toEqual([
        { value: "Yes", caption: "Yes" },
        { value: "n", caption: "No" },
      ]);
    });

    it("should produce no prevalues when options are omitted", () => {
      const built = buildField(field({ label: "Name", type: "text" }), new Set());
      expect((built as any).preValues).toEqual([]);
    });
  });

  describe("settings", () => {
    it("should apply the FieldType implied by an alias", () => {
      const built = buildField(field({ label: "Email", type: "email" }), new Set());
      expect((built as any).settings.FieldType).toBe("email");
      expect((built as any).settings.AutocompleteAttribute).toBe("email");
    });

    it("should let caller settings override derived ones", () => {
      const built = buildField(
        field({ label: "Email", type: "email", placeholder: "derived", settings: { Placeholder: "explicit" } }),
        new Set(),
      );

      expect((built as any).settings.Placeholder).toBe("explicit");
    });

    it("should map the same underlying type for aliases that differ only by FieldType", () => {
      const email = buildField(field({ label: "E", type: "email" }), new Set());
      const phone = buildField(field({ label: "P", type: "phone" }), new Set());

      expect((email as any).fieldTypeId).toBe(FORMS_FIELD_TYPE_IDS.shortAnswer);
      expect((phone as any).fieldTypeId).toBe(FORMS_FIELD_TYPE_IDS.shortAnswer);
      expect((phone as any).settings.FieldType).toBe("tel");
    });
  });
});

describe("simpleFieldSchema", () => {
  it("should reject an empty label", () => {
    expect(simpleFieldSchema.safeParse({ label: "", type: "text" }).success).toBe(false);
  });

  it("should reject a type outside the alias list", () => {
    expect(simpleFieldSchema.safeParse({ label: "A", type: "nope" }).success).toBe(false);
  });

  it("should accept a question mark in a label", () => {
    // The body sanitiser permits these; the schema must not re-reject them.
    expect(simpleFieldSchema.safeParse({ label: "What is your name?", type: "text" }).success).toBe(true);
  });
});

describe("withFormDesignDefaults", () => {
  it("should backfill every default for a name-and-pages-only design", () => {
    const design = withFormDesignDefaults({ name: "Minimal", pages: [] });

    const defaults = formDesignDefaults("irrelevant");
    for (const key of Object.keys(defaults)) {
      expect(design).toHaveProperty(key);
    }
    expect(design.name).toBe("Minimal");
  });

  it("should preserve an explicit null rather than treating it as absent", () => {
    // folderId and cssClass take null as a meaningful value.
    const design = withFormDesignDefaults({ name: "N", pages: [], cssClass: null, folderId: null });

    expect(design.cssClass).toBeNull();
    expect(design.folderId).toBeNull();
  });

  it("should mirror unique onto id unless given", () => {
    const design = withFormDesignDefaults({ name: "N", pages: [] });
    expect(design.unique).toBe(design.id);

    const explicit = withFormDesignDefaults({ name: "N", pages: [], unique: "fixed-unique" });
    expect(explicit.unique).toBe("fixed-unique");
  });

  it("should not overwrite a caller-supplied value with a default", () => {
    const design = withFormDesignDefaults({ name: "N", pages: [], submitLabel: "Send it" });
    expect(design.submitLabel).toBe("Send it");
  });
});
