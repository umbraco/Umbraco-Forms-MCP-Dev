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
  getWorkflowTypeResponseItem,
} from "../generated/umbracoFormsManagementApi.zod.js";

describe("relaxMidLineFields", () => {
  it("should drop only the listed properties from required", () => {
    const spec = {
      components: {
        schemas: {
          Field: { required: ["id", "caption", "memberPrefillMode"] },
          Unrelated: { required: ["memberPrefillMode"] },
        },
      },
    };

    relaxMidLineFields(spec);

    expect(spec.components.schemas.Field.required).toEqual(["id", "caption"]);
    expect(spec.components.schemas.Unrelated.required).toEqual(["memberPrefillMode"]);
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
  it("should accept a workflow type without isConfigured (Forms < 18.1)", () => {
    const result = getWorkflowTypeResponseItem.safeParse({
      id: "3f2b8c1e-9a4d-4e7b-8c6a-1d2e3f4a5b6c",
      unique: "3f2b8c1e-9a4d-4e7b-8c6a-1d2e3f4a5b6c",
      entityType: null,
      alias: "sendEmail",
      name: "Send email",
      description: "",
      icon: "icon-message",
      group: "Email",
      settings: [],
    });
    expect(result.error?.issues ?? []).toEqual([]);
  });

  it("should not require memberPrefillMode on a form field (Forms < 18.1)", () => {
    const field = getFormByIdResponse.shape.pages.element.shape.fieldSets.element.shape.containers
      .element.shape.fields.element;
    expect(field.shape.memberPrefillMode.safeParse(undefined).success).toBe(true);
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
