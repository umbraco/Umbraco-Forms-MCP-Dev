/**
 * The mid-line response properties must come out optional in the generated
 * schemas, or tools fail output validation on the Forms releases that predate
 * them. These pin the transformer and check the generated zod still reflects it.
 */

import { MID_LINE_PROPERTIES, relaxMidLineFields } from "../relax-mid-line-fields.js";
import {
  getFolderByIdResponse,
  getFormByFormIdRecordResponse,
  getFormByIdResponse,
  getFormResponse,
  getTreeFormRootResponse,
} from "../generated/umbracoFormsManagementApi.zod.js";

describe("relaxMidLineFields", () => {
  it("should drop only the listed properties from required", () => {
    const spec = {
      components: {
        schemas: {
          BasicForm: { required: ["id", "name", "entries"] },
          Unrelated: { required: ["entries"] },
        },
      },
    };

    relaxMidLineFields(spec);

    expect(spec.components.schemas.BasicForm.required).toEqual(["id", "name"]);
    expect(spec.components.schemas.Unrelated.required).toEqual(["entries"]);
  });

  it("should leave a spec without those schemas alone", () => {
    const spec = { components: { schemas: { Other: { required: ["a"] } } } };
    expect(relaxMidLineFields(spec)).toEqual({ components: { schemas: { Other: { required: ["a"] } } } });
  });

  it("should list every property it relaxes against a schema name", () => {
    for (const properties of Object.values(MID_LINE_PROPERTIES)) {
      expect(properties.length).toBeGreaterThan(0);
    }
  });
});

describe("generated schemas", () => {
  it("should accept a form list item without entries (Forms < 17.3)", () => {
    const item = { id: "3f2b8c1e-9a4d-4e7b-8c6a-1d2e3f4a5b6c", name: "Contact", fields: "", summary: "" };
    expect(getFormResponse.safeParse([item]).success).toBe(true);
  });

  it("should accept a tree item without icon (Forms < 17.1)", () => {
    const result = getTreeFormRootResponse.safeParse({
      total: 1,
      items: [
        {
          hasChildren: false,
          id: "3f2b8c1e-9a4d-4e7b-8c6a-1d2e3f4a5b6c",
          parent: null,
          flags: [],
          name: "Contact",
          isFolder: false,
          path: "-1,3f2b8c1e-9a4d-4e7b-8c6a-1d2e3f4a5b6c",
        },
      ],
    });
    expect(result.error?.issues ?? []).toEqual([]);
  });
});

describe("generated schemas - properties Forms 17.6 / 18.2 added", () => {
  it("should not require trashed on a folder or a form", () => {
    expect(getFolderByIdResponse.shape.trashed.safeParse(undefined).success).toBe(true);
    expect(getFormByIdResponse.shape.trashed.safeParse(undefined).success).toBe(true);
  });

  it("should not require additionalData or isDateField on a record search", () => {
    const shape = getFormByFormIdRecordResponse.shape;
    expect(shape.results.element.shape.additionalData.safeParse(undefined).success).toBe(true);
    expect(shape.schema.element.shape.isDateField.safeParse(undefined).success).toBe(true);
  });
});
