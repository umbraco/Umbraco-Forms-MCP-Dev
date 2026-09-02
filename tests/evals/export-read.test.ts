/**
 * Export Read Eval Test
 *
 * Verifies an LLM agent can use the "export" collection's list-export-types
 * tool correctly against the real, live Umbraco instance (no mocks exist for
 * the Forms Management API).
 *
 * generate-form-export/download-export-file are deliberately excluded: they
 * return a 500 when the target form has zero submitted records, which is a
 * real API limitation (already documented by the export integration tests),
 * not something to work around here.
 *
 * list-export-types needs a real formId to query against. Rather than have
 * the LLM create a form itself (out of scope for this read-only eval), a
 * throwaway form is created directly via the raw generated API client in
 * beforeAll and deleted in afterAll, mirroring the pattern in
 * src/umbraco-api/tools/export/__tests__/helpers/export-test-form-helper.ts.
 */

import { describe, it, beforeAll, afterAll } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";
import { CAPTURE_RAW_HTTP_RESPONSE, type HttpResponse } from "@umbraco-cms/mcp-server-sdk";
import {
  getUmbracoFormsManagementAPI,
  type FormDesign,
} from "../../src/umbraco-api/api/generated/umbracoFormsManagementApi.js";

const TEST_EXPORT_EVAL_FORM_NAME = "_Test Export Eval Form";

let testFormId: string;

async function createTestForm(): Promise<string> {
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
    name: TEST_EXPORT_EVAL_FORM_NAME,
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

async function deleteTestForm(id: string): Promise<void> {
  if (!id) return;

  const client = getUmbracoFormsManagementAPI();
  try {
    await client.deleteFormById(id, CAPTURE_RAW_HTTP_RESPONSE);
  } catch {
    // Ignore delete failures in cleanup
  }
}

describe("Export Read Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  beforeAll(async () => {
    testFormId = await createTestForm();
  }, timeout);

  afterAll(async () => {
    await deleteTestForm(testFormId);
  }, timeout);

  it(
    "should list the available export types for a form",
    async () => {
      // testFormId is only known once beforeAll has run, so the scenario
      // (and its prompt, which embeds the real form id) must be built here,
      // inside the test body — NOT passed directly to runScenarioTest() at
      // describe-collection time, when the template literal would still
      // evaluate testFormId as undefined.
      await runScenarioTest({
        prompt: `List the available export types for the Umbraco Form with id "${testFormId}", then say "EXPORT TYPES RETRIEVED" followed by the alias of each export type you found.`,
        tools: ["list-export-types"],
        requiredTools: ["list-export-types"],
        successPattern: "EXPORT TYPES RETRIEVED",
        verbose: true,
      })();
    },
    timeout
  );
});
