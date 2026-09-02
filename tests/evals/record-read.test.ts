/**
 * Record Read Eval Test
 *
 * Verifies an LLM agent can use two of the "record" collection's read-only
 * tools correctly:
 *   - get-record-set-actions: no params, lists bulk actions available
 *     against form records. Always works.
 *   - search-records: needs a formId. Umbraco Forms records (submissions)
 *     are only created via the public front-end submit flow, not this
 *     Management API — this project's integration tests already confirmed
 *     there's no reachable way to seed a real record here, and the live
 *     instance currently has zero persistent forms/records. So this test
 *     uses a fixed, syntactically-valid-but-nonexistent GUID as the
 *     formId (documented below). Since no form with that ID exists on the
 *     connected instance, the API legitimately responds with a 404 Not
 *     Found rather than a 200 with an empty result array — that's the
 *     correct, expected outcome for this call, not a tool bug, and the
 *     prompt tells the agent not to treat it as an error.
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

// Well-formed GUID, not a real form on the connected instance. search-records
// is expected to respond with a 404 Not Found for it (no such form exists)
// rather than a list of records — that's the correct behavior being
// demonstrated here, not a bug.
const NONEXISTENT_FORM_ID = "00000000-0000-0000-0000-000000000000";

describe("Record Read Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should list record set actions and search records for a form",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Call get-record-set-actions to list the bulk actions available against form records.
2. Call search-records with formId "${NONEXISTENT_FORM_ID}" to search that form's submitted records. No form with this ID exists on this instance, so a "not found" response is the expected, correct outcome — do not treat it as a failure, just report it as the search result.
3. Report how many record-set actions were found, and what search-records returned for the form ID (e.g. no matching form / zero records).
4. Say "RECORD TOOLS DEMONSTRATED"`,
      tools: ["get-record-set-actions", "search-records"],
      requiredTools: ["get-record-set-actions", "search-records"],
      successPattern: "RECORD TOOLS DEMONSTRATED",
      verbose: true,
    }),
    timeout
  );
});
