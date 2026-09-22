/**
 * Unit tests for the relaxed `pages` schema and its backfill.
 *
 * `relaxedPagesSchema` lets a caller supply only each field's caption and
 * fieldTypeId; `normalizePages` fills in everything else the API requires —
 * GUIDs at four nesting levels, sort orders, parent back-references and ~18
 * per-field defaults. All of those defaults are hardcoded here rather than read
 * from Forms, so the snapshot pins them and the assertions cover the rules the
 * snapshot can't state.
 */

import { randomUUID } from "node:crypto";
import { relaxedPagesSchema, normalizePages } from "../shared/form-pages-schema.js";
import { FORMS_FIELD_TYPE_IDS } from "../shared/form-field-types.js";
import { FormTestHelper } from "./helpers/form-test-helper.js";

const FORM_ID = "11111111-1111-1111-1111-111111111111";

const minimalPages = [
  {
    fieldSets: [
      {
        containers: [
          {
            fields: [
              { caption: "Your name", fieldTypeId: FORMS_FIELD_TYPE_IDS.shortAnswer },
            ],
          },
        ],
      },
    ],
  },
];

describe("relaxedPagesSchema", () => {
  it("should accept a page carrying only captions and field type ids", () => {
    expect(relaxedPagesSchema.safeParse(minimalPages).success).toBe(true);
  });

  it("should accept the fieldSet.fields shorthand", () => {
    const pages = [
      {
        fieldSets: [
          { fields: [{ caption: "A", fieldTypeId: FORMS_FIELD_TYPE_IDS.shortAnswer }] },
        ],
      },
    ];

    expect(relaxedPagesSchema.safeParse(pages).success).toBe(true);
  });

  it("should reject a field missing its caption", () => {
    const pages = [
      { fieldSets: [{ containers: [{ fields: [{ fieldTypeId: "x" }] }] }] },
    ];

    expect(relaxedPagesSchema.safeParse(pages).success).toBe(false);
  });

  it("should reject a field missing its fieldTypeId", () => {
    const pages = [
      { fieldSets: [{ containers: [{ fields: [{ caption: "A" }] }] }] },
    ];

    expect(relaxedPagesSchema.safeParse(pages).success).toBe(false);
  });

  it("should reject a page without fieldSets", () => {
    expect(relaxedPagesSchema.safeParse([{ caption: "No fieldsets" }]).success).toBe(false);
  });
});

describe("normalizePages", () => {
  it("should backfill a minimal page into the full wire shape", () => {
    expect(
      FormTestHelper.normalizeIds(normalizePages(minimalPages, FORM_ID)),
    ).toMatchSnapshot();
  });

  it("should return an empty array for a non-array input", () => {
    expect(normalizePages(undefined, FORM_ID)).toEqual([]);
    expect(normalizePages(null, FORM_ID)).toEqual([]);
    expect(normalizePages("nope", FORM_ID)).toEqual([]);
  });

  it("should point every page at the owning form and every fieldset at its page", () => {
    const [page] = normalizePages(minimalPages, FORM_ID);

    expect(page.form).toBe(FORM_ID);
    expect((page.fieldSets as any)[0].page).toBe(page.id);
  });

  it("should expand the fieldSet.fields shorthand into one full-width container", () => {
    const pages = [
      {
        fieldSets: [
          { fields: [{ caption: "A", fieldTypeId: FORMS_FIELD_TYPE_IDS.shortAnswer }] },
        ],
      },
    ];

    const [page] = normalizePages(pages, FORM_ID);
    const fieldSet = (page.fieldSets as any)[0];

    expect(fieldSet.containers).toHaveLength(1);
    expect(fieldSet.containers[0].width).toBe(12);
    expect(fieldSet.containers[0].fields).toHaveLength(1);
    // The shorthand key is not part of the wire shape.
    expect(fieldSet).not.toHaveProperty("fields");
  });

  it("should default sort orders to array position", () => {
    const pages = [
      { fieldSets: [{ containers: [{ fields: [] }] }, { containers: [{ fields: [] }] }] },
      { fieldSets: [] },
    ];

    const normalized = normalizePages(pages, FORM_ID);

    expect(normalized[0].sortOrder).toBe(0);
    expect(normalized[1].sortOrder).toBe(1);
    expect((normalized[0].fieldSets as any)[1].sortOrder).toBe(1);
  });

  it("should preserve caller-supplied ids and sort orders", () => {
    const pageId = randomUUID();
    const pages = [
      {
        id: pageId,
        sortOrder: 7,
        fieldSets: [{ containers: [{ fields: [] }] }],
      },
    ];

    const [page] = normalizePages(pages, FORM_ID);

    expect(page.id).toBe(pageId);
    expect(page.sortOrder).toBe(7);
  });

  describe("alias handling", () => {
    const aliasesOf = (pages: unknown) =>
      (normalizePages(pages, FORM_ID)[0].fieldSets as any)[0].containers[0].fields.map(
        (f: any) => f.alias,
      );

    it("should derive an alias from the caption", () => {
      expect(
        aliasesOf([
          {
            fieldSets: [
              {
                containers: [
                  { fields: [{ caption: "Email address", fieldTypeId: "x" }] },
                ],
              },
            ],
          },
        ]),
      ).toEqual(["emailAddress"]);
    });

    it("should not let a derived alias collide with one supplied later", () => {
      // Caller aliases are reserved up front, so the derived one steps aside
      // regardless of the order the fields appear in.
      const pages = [
        {
          fieldSets: [
            {
              containers: [
                {
                  fields: [
                    { caption: "Name", fieldTypeId: "x" },
                    { caption: "Other", fieldTypeId: "x", alias: "name" },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const aliases = aliasesOf(pages);

      expect(aliases).toEqual(["name2", "name"]);
      expect(new Set(aliases).size).toBe(aliases.length);
    });

    it("should fall back to 'field' when a caption is missing", () => {
      const pages = [
        { fieldSets: [{ containers: [{ fields: [{ fieldTypeId: "x" }] }] }] },
      ];

      expect(aliasesOf(pages)).toEqual(["field"]);
    });
  });

  it("should preserve an explicit null over its default", () => {
    const pages = [
      {
        caption: null,
        fieldSets: [
          {
            containers: [
              {
                fields: [
                  { caption: "A", fieldTypeId: "x", regex: null, tooltip: null },
                ],
              },
            ],
          },
        ],
      },
    ];

    const field = (normalizePages(pages, FORM_ID)[0].fieldSets as any)[0]
      .containers[0].fields[0];

    expect(field.regex).toBeNull();
    expect(field.tooltip).toBeNull();
  });
});
