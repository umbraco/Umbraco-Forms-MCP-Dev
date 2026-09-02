/**
 * Workflow Type Read Eval Test
 *
 * Verifies an LLM agent can chain the "workflow-type" collection's two
 * read-only tools: list all workflow types, then look one up by id. Workflow
 * types are fixed system/package definitions (e.g. Send Email, Send to URL)
 * — they are not created or edited by users, so this is a read-only,
 * list-then-get scenario against the real, live Umbraco instance.
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const WORKFLOW_TYPE_TOOLS = ["list-workflow-types", "get-workflow-type-by-id"] as const;

describe("Workflow Type Read Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should list workflow types then fetch one by its real id",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. List all Umbraco Forms workflow types.
2. In the results, find the workflow type named "Send email". Each workflow
   type has both an "id" field and a "unique" field — these are NOT
   interchangeable. Use the value from the "unique" field as the identifier
   for the next step (the "id" field is not a usable lookup value for this
   entity type).
3. Call get-workflow-type-by-id with that identifier to fetch its full
   details.
4. Confirm the fetched workflow type's alias is "sendEmail".
5. Say "WORKFLOW TYPE DETAILS RETRIEVED" followed by the workflow type's
   description.

Never hardcode an id — always take it from the list result in step 1.`,
      tools: [...WORKFLOW_TYPE_TOOLS],
      requiredTools: [...WORKFLOW_TYPE_TOOLS],
      successPattern: "WORKFLOW TYPE DETAILS RETRIEVED",
      verbose: true,
    }),
    timeout
  );
});
