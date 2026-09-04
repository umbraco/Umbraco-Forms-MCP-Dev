/**
 * Form Submission Builder
 *
 * Fluent builder for creating a form the Delivery API can render and accept
 * entries against. Follows the same scaffold-then-overlay pattern as
 * `form/__tests__/helpers/form-builder.ts` (Umbraco Forms' `POST /form`
 * requires a complete, client-supplied FormDesign — there's no server-side
 * ID generation), but additionally injects a real text field: the scaffold
 * on its own only carries the built-in, mandatory `dataConsent` field, which
 * has no plain-text alias a Delivery API submission could target.
 *
 * The `dataConsent` field's own shape is used as a template for the new
 * field — it's the one field object the scaffold is guaranteed to already
 * populate correctly, so cloning it and overriding a few properties is more
 * robust than hand-authoring a field object against the generated types.
 */

import { randomUUID } from "node:crypto";
import { CAPTURE_RAW_HTTP_RESPONSE, type HttpResponse } from "@umbraco-cms/mcp-server-sdk";
import {
  getUmbracoFormsManagementAPI,
  type FormDesign,
  type FieldTypeWithSettings,
} from "../../../../api/generated/umbracoFormsManagementApi.js";

export const TEST_FORM_NAME = "_Test Form Submission";
export const TEST_FIELD_ALIAS = "shortAnswer";

export class FormSubmissionBuilder {
  private formName: string = TEST_FORM_NAME;
  private createdId?: string;
  private createdDesign?: FormDesign;

  withName(name: string): this {
    this.formName = name;
    return this;
  }

  async create(): Promise<this> {
    const client = getUmbracoFormsManagementAPI();

    const scaffoldResponse = (await client.getFormScaffold(
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as unknown as HttpResponse<FormDesign>;

    if (scaffoldResponse.status < 200 || scaffoldResponse.status >= 300) {
      throw new Error(
        `Failed to fetch form scaffold: HTTP ${scaffoldResponse.status} ${JSON.stringify(scaffoldResponse.data)}`,
      );
    }

    const fieldTypesResponse = await client.getFieldType();
    const fieldTypes = fieldTypesResponse as unknown as FieldTypeWithSettings[];
    const shortAnswerType =
      fieldTypes.find((type) => type.name === "Short answer") ?? fieldTypes[0];

    if (!shortAnswerType) {
      throw new Error("No field types available on this Umbraco instance");
    }

    const design: FormDesign = structuredClone(scaffoldResponse.data);
    design.name = this.formName;

    const container = (design.pages as any)[0].fieldSets[0].containers[0];
    const templateField = container.fields[0];

    // The scaffold's default dataConsent field is mandatory — leave it in
    // place (submit-form-entry should tolerate untouched fields) but stop
    // requiring it so entries can be submitted without providing it.
    templateField.mandatory = false;

    container.fields.push({
      ...templateField,
      id: randomUUID(),
      alias: TEST_FIELD_ALIAS,
      caption: "Short Answer",
      fieldTypeId: shortAnswerType.id,
      mandatory: false,
      requiredErrorMessage: null,
      settings: {},
      preValues: [],
    });

    const createResponse = (await client.postForm(
      design,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as unknown as HttpResponse<void>;

    if (createResponse.status < 200 || createResponse.status >= 300) {
      throw new Error(
        `Failed to create test form: HTTP ${createResponse.status} ${JSON.stringify(createResponse.data)}`,
      );
    }

    this.createdId = design.id;
    this.createdDesign = design;

    return this;
  }

  async delete(): Promise<void> {
    if (!this.createdId) return;
    const client = getUmbracoFormsManagementAPI();
    try {
      await client.deleteFormById(this.createdId, CAPTURE_RAW_HTTP_RESPONSE);
    } catch {
      // Ignore delete failures during cleanup.
    }
    this.createdId = undefined;
  }

  getId(): string {
    if (!this.createdId) {
      throw new Error("Form not created yet. Call create() first.");
    }
    return this.createdId;
  }

  getDesign(): FormDesign {
    if (!this.createdDesign) {
      throw new Error("Form not created yet. Call create() first.");
    }
    return this.createdDesign;
  }
}
