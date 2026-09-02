/**
 * Form Builder
 *
 * Fluent builder for creating Umbraco Forms forms as test data.
 *
 * Umbraco Forms' `POST /form` endpoint requires a *complete* form design
 * (the form's own ID, page IDs, field IDs, etc. are all client-supplied) —
 * there is no server-side ID generation on create like plain entities. The
 * only supported way to get a valid starting design is to fetch a scaffold
 * first (mirrors what create-form.ts's own doc comment instructs), so this
 * builder always calls `getFormScaffold()` and overlays test overrides on
 * top rather than hand-writing a FormDesign.
 */

import { randomUUID } from "node:crypto";
import { CAPTURE_RAW_HTTP_RESPONSE, type HttpResponse } from "@umbraco-cms/mcp-server-sdk";
import {
  getUmbracoFormsManagementAPI,
  type FormDesign,
} from "../../../../api/generated/umbracoFormsManagementApi.js";

export const TEST_FORM_NAME = "_Test Form";

// The built-in "Send email" workflow type — a fixed system definition that
// always exists on any Umbraco Forms instance. Used by withOnSubmitWorkflow()
// so copy-form-workflows has a real workflow to copy.
const SEND_EMAIL_WORKFLOW_TYPE_ID = "e96badd7-05be-4978-b8d9-b3d733de70a5";

interface FormOverrides {
  name?: string;
  folderId?: string | null;
}

export class FormBuilder {
  private overrides: FormOverrides = {
    name: TEST_FORM_NAME,
  };

  private includeWorkflow = false;
  private createdId?: string;
  private createdDesign?: FormDesign;

  withName(name: string): this {
    this.overrides.name = name;
    return this;
  }

  withFolderId(folderId: string): this {
    this.overrides.folderId = folderId;
    return this;
  }

  /** Adds a real "Send email" onSubmit workflow to the scaffold before creating. */
  withOnSubmitWorkflow(): this {
    this.includeWorkflow = true;
    return this;
  }

  build(): FormOverrides {
    return { ...this.overrides };
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

    const design: FormDesign = {
      ...scaffoldResponse.data,
      name: this.overrides.name ?? TEST_FORM_NAME,
      folderId: this.overrides.folderId ?? scaffoldResponse.data.folderId ?? null,
    };

    if (this.includeWorkflow) {
      design.formWorkflows = {
        ...design.formWorkflows,
        onSubmit: [
          ...(design.formWorkflows?.onSubmit ?? []),
          {
            id: randomUUID(),
            name: "_Test Send Email Workflow",
            form: design.id,
            active: true,
            includeSensitiveData: "False",
            isDeleted: false,
            sortOrder: 0,
            workflowTypeId: SEND_EMAIL_WORKFLOW_TYPE_ID,
            workflowTypeName: "Send email",
            workflowTypeDescription: "",
            workflowTypeIcon: "",
            workflowTypeGroup: "",
            settings: {},
            isMandatory: false,
            condition: null,
          },
        ],
      };
    }

    const createResponse = (await client.postForm(
      design,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as unknown as HttpResponse<void>;

    if (createResponse.status < 200 || createResponse.status >= 300) {
      throw new Error(
        `Failed to create form: HTTP ${createResponse.status} ${JSON.stringify(createResponse.data)}`,
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
      // Ignore delete failures in cleanup — the instance is shared and the
      // form may already have been removed by the test itself.
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
