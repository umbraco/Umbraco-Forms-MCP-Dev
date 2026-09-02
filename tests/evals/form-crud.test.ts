/**
 * Form CRUD Eval Test
 *
 * Verifies an LLM agent can complete a full create-read-update-delete
 * lifecycle using the "form" collection's tools, against the real,
 * live Umbraco instance (no mocks exist for the Forms Management API).
 *
 * create-form/update-form take the FULL nested FormDesign schema, so the
 * prompt is deliberately explicit about the scaffold-first flow: fetch
 * get-form-scaffold, change only the "name" field, and submit the rest of
 * the scaffold unchanged — never inventing GUIDs. Uses a timestamp in the
 * name to avoid colliding with any other test data.
 */

import { describe, it } from "@jest/globals";
import { runScenarioTest, setupConsoleMock } from "@umbraco-cms/mcp-server-sdk/evals";

const FORM_TOOLS = [
  "get-form-scaffold",
  "create-form",
  "list-forms",
  "get-form-by-id",
  "update-form",
  "delete-form",
] as const;

// The form design payload (scaffold, create, get-by-id, update) is much
// larger than a typical entity — each turn round-trips a full nested
// FormDesign object. The project-wide eval default of 60s is too tight for
// this six-tool workflow, so this test uses a longer, file-local Jest
// timeout (wall clock only) rather than touching the shared eval defaults
// in tests/evals/helpers/e2e-setup.ts.
const timeout = 180000;

describe("Form CRUD Operations", () => {
  setupConsoleMock();

  it(
    "should complete a full create-read-update-delete form workflow",
    runScenarioTest({
      prompt: `Complete these tasks in order, using the Umbraco Forms form tools:
1. Generate a unique identifier using the current timestamp.
2. Call get-form-scaffold to get a blank form design. This returns a complete FormDesign object with all required GUIDs already generated — do NOT invent any IDs yourself.
3. Create the form by calling create-form with that exact scaffold object, changing ONLY the top-level "name" field to "Eval Test Form {timestamp}". Every other field (id, pages, fieldsets, fields, workflows, settings, etc.) must be passed through completely unchanged from the scaffold.
4. Call list-forms and confirm a form named "Eval Test Form {timestamp}" appears in the results.
5. Call get-form-by-id using the form's id (the same id from the scaffold) to fetch its full current design.
6. Call update-form to rename the form: take the exact design object returned by get-form-by-id, change ONLY the "name" field to "Eval Test Form {timestamp} Renamed", and pass everything else through unchanged (including the same id).
7. Call delete-form using the form's id to permanently delete it.
8. Say "FORM CRUD WORKFLOW COMPLETE" once all steps succeed.`,
      tools: [...FORM_TOOLS],
      requiredTools: [
        "get-form-scaffold",
        "create-form",
        "list-forms",
        "get-form-by-id",
        "update-form",
        "delete-form",
      ],
      successPattern: "FORM CRUD WORKFLOW COMPLETE",
      verbose: true,
      options: {
        // The full FormDesign payload round-trips through several turns
        // (scaffold, create, get-by-id, update) — give the agent a bit more
        // budget than the project default (0.25) to comfortably finish.
        maxBudget: 0.5,
      },
    }),
    timeout
  );
});
