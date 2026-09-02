/**
 * Prevalue Source CRUD Eval Test
 *
 * Verifies an LLM agent can complete a full create-read-update-delete
 * lifecycle using the "prevalue-source" collection's tools, against the
 * real, live Umbraco instance (no mocks exist for the Forms Management API).
 * Uses a timestamp in the name to avoid colliding with any other test data.
 *
 * The prevalue source type id used below ("dataSource", the built-in
 * "Static Values" provider) and its empty settings shape were confirmed
 * against the live instance to match the values the integration test suite's
 * PrevalueSourceBuilder resolves at runtime (see
 * src/umbraco-api/tools/prevalue-source/__tests__/helpers/prevalue-source-builder.ts).
 * They are given directly to the LLM here because this eval's tool set is
 * scoped to the "prevalue-source" collection only — it does not include the
 * "prevalue-source-type" list tool an LLM would normally use to discover them.
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const PREVALUE_SOURCE_TOOLS = [
  "create-prevalue-source",
  "get-prevalue-source",
  "list-prevalue-sources",
  "update-prevalue-source",
  "delete-prevalue-source",
] as const;

// Built-in "DataSource" (Static Values) prevalue source type — needs no settings.
const DATA_SOURCE_TYPE_ID = "cc9f9b2a-a746-11de-9e17-681b56d89593";

describe("Prevalue Source CRUD Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should complete a full create-read-update-delete prevalue source workflow",
    runScenarioTest({
      prompt: `Complete these tasks in order, using the Umbraco Forms prevalue source tools:
1. Generate a unique identifier using the current timestamp.
2. Create a new prevalue source named "Eval Test Prevalue Source {timestamp}" using
   fieldPreValueSourceTypeId "${DATA_SOURCE_TYPE_ID}". Do not pass a settings field — this
   provider type needs none.
3. List prevalue sources and confirm the one you just created appears in the results.
4. Get the prevalue source you created by its ID to verify its name matches what you created.
5. Update the prevalue source's name to "Eval Test Prevalue Source {timestamp} Renamed".
6. Delete the prevalue source you created.
7. Say "PREVALUE SOURCE CRUD WORKFLOW COMPLETE" once all steps succeed.`,
      tools: [...PREVALUE_SOURCE_TOOLS],
      requiredTools: [
        "create-prevalue-source",
        "list-prevalue-sources",
        "get-prevalue-source",
        "update-prevalue-source",
        "delete-prevalue-source",
      ],
      successPattern: "PREVALUE SOURCE CRUD WORKFLOW COMPLETE",
      verbose: true,
    }),
    timeout
  );
});
