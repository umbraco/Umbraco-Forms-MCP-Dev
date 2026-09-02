import { CAPTURE_RAW_HTTP_RESPONSE, type HttpResponse } from "@umbraco-cms/mcp-server-sdk";
import {
  getUmbracoFormsManagementAPI,
  type FormDesign,
} from "../../../../api/generated/umbracoFormsManagementApi.js";

const TEST_EXPORT_FORM_NAME = "_Test Export Form";

/**
 * Lightweight helper for the export tool collection. The export tools don't create or
 * delete their own persistent entities — generate-form-export/download-export-file/
 * list-export-types all need a real, existing Form to operate against. This helper
 * creates a throwaway Form for the duration of the export tests and removes it afterward.
 *
 * Unlike a full CRUD builder, the created form's ID is known up-front: get-form-scaffold
 * returns a complete FormDesign with its `id` already generated, and postForm (which
 * returns void) doesn't hand back a new one — the scaffold's `id` IS the form's ID once
 * created.
 */
export class ExportTestFormHelper {
  /**
   * Creates a temporary form (using the server's form scaffold) named
   * `_Test Export Form` and returns its ID.
   */
  static async createTestForm(): Promise<string> {
    const client = getUmbracoFormsManagementAPI();

    const scaffoldResponse = (await client.getFormScaffold(
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<FormDesign>;

    if (scaffoldResponse.status < 200 || scaffoldResponse.status >= 300) {
      throw new Error(
        `Failed to fetch form scaffold: HTTP ${scaffoldResponse.status} ${scaffoldResponse.statusText}`,
      );
    }

    const formDesign: FormDesign = {
      ...scaffoldResponse.data,
      name: TEST_EXPORT_FORM_NAME,
    };

    const createResponse = (await client.postForm(
      formDesign,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<void>;

    if (createResponse.status < 200 || createResponse.status >= 300) {
      throw new Error(
        `Failed to create test form: HTTP ${createResponse.status} ${createResponse.statusText}`,
      );
    }

    return formDesign.id;
  }

  /**
   * Deletes the temporary form created with createTestForm(). Swallows errors so
   * cleanup never masks a test failure.
   */
  static async deleteTestForm(id: string): Promise<void> {
    if (!id) return;

    const client = getUmbracoFormsManagementAPI();
    try {
      await client.deleteFormById(id, CAPTURE_RAW_HTTP_RESPONSE);
    } catch {
      // Ignore delete failures in cleanup
    }
  }
}

export { TEST_EXPORT_FORM_NAME };
