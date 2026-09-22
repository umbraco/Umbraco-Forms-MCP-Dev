/**
 * Simple Form Authoring Eval Test
 *
 * The fast path counterpart to form-crud.test.ts.
 *
 * That test exercises the full-design flow: fetch get-form-scaffold, echo a
 * complete nested FormDesign back through create-form, and round-trip it again
 * to update. It needs a 180s timeout and double the default budget because
 * every turn carries a multi-KB object.
 *
 * This test covers the same outcome — a real form, created and then extended —
 * through create-simple-form and add-form-fields, which take a flat list of
 * fields and generate the design server-side. No scaffold call, no GUIDs, no
 * large literals. The prompt deliberately does *not* spell out the mechanics:
 * the point is that an agent can get this right from the tool descriptions
 * alone, which is what the old flow could not do.
 *
 * The field labels are chosen to include a question mark and an ampersand —
 * the characters the SDK's default URL-oriented sanitiser used to reject in
 * form text (see src/umbraco-api/tools/shared/body-text.ts).
 */

import { describe, it } from "@jest/globals";
import { runScenarioTest, setupConsoleMock } from "@umbraco-cms/mcp-server-sdk/evals";

const TOOLS = [
  "create-simple-form",
  "add-form-fields",
  "list-forms",
  "get-form-by-id",
  "delete-form",
] as const;

// Comfortably under form-crud's 180s: the payloads here are small, but this
// still makes several live API round-trips.
const timeout = 120000;

describe("Simple Form Authoring", () => {
  setupConsoleMock();

  it(
    "should create and extend a form without hand-writing a form design",
    runScenarioTest({
      prompt: `Using the Umbraco Forms tools, complete these tasks in order:
1. Generate a unique identifier using the current timestamp.
2. Create a contact form named "Eval Simple Form {timestamp}" with these fields:
   - "What is your name?" — a mandatory text field
   - "Email address" — a mandatory email field
   - "How did you hear about us?" — a dropdown with the options Search, A friend, and Other
   - "Terms & conditions" — a mandatory consent field
3. Call list-forms and confirm the form appears in the results.
4. Add one more field to that existing form: a long-answer field labelled "Anything else?". Do not recreate the form.
5. Call get-form-by-id and confirm the form now has five fields, including "Anything else?".
6. Call delete-form to permanently delete the form.
7. Say "SIMPLE FORM WORKFLOW COMPLETE" once all steps succeed.`,
      tools: [...TOOLS],
      requiredTools: [
        "create-simple-form",
        "add-form-fields",
        "list-forms",
        "get-form-by-id",
        "delete-form",
      ],
      successPattern: "SIMPLE FORM WORKFLOW COMPLETE",
      verbose: true,
      // Left at the project default (0.25) on purpose: needing more than the
      // default here would mean the compact tools are not actually cheaper.
    }),
    timeout
  );
});
