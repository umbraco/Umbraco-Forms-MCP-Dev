/**
 * Data Source CRUD Eval Test
 *
 * Verifies an LLM agent can complete a full create-read-update-delete
 * lifecycle using the "data-source" collection's tools, against the real,
 * live Umbraco instance (no mocks exist for the Forms Management API).
 *
 * The only built-in data source type on this instance is "SQL Database"
 * (formDataSourceTypeId f19506f3-efea-4b13-a308-89348f69df91). It validates
 * connectivity live against the settings it's given, so the prompt points it
 * at the same real local SQL Server that already backs this Umbraco instance
 * (see src/umbraco-api/tools/data-source/__tests__/helpers/data-source-builder.ts),
 * against a stock Umbraco system table with only basic column types.
 *
 * Uses a timestamp in the name to avoid colliding with any other test data.
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const DATA_SOURCE_TOOLS = [
  "create-data-source",
  "get-data-source",
  "list-data-sources",
  "update-data-source",
  "delete-data-source",
] as const;

const SQL_DATA_SOURCE_TYPE_ID = "f19506f3-efea-4b13-a308-89348f69df91";
const SQL_CONNECTION_STRING =
  "Server=localhost,1433;Database=FormsMcpDb;User Id=sa;Password=MyStrong!Passw0rd;TrustServerCertificate=True;Encrypt=False";
const SQL_TABLE = "umbracoLock";

describe("Data Source CRUD Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should complete a full create-read-update-delete data source workflow",
    runScenarioTest({
      prompt: `Complete these tasks in order, using the Umbraco Forms data source tools:
1. Generate a unique identifier using the current timestamp.
2. Create a new data source named "Eval Test Data Source {timestamp}" with:
   - formDataSourceTypeId: "${SQL_DATA_SOURCE_TYPE_ID}" (this is the built-in "SQL Database" data source type — use this exact id, do not look up or invent another one)
   - settings: { "Connection": "${SQL_CONNECTION_STRING}", "Table": "${SQL_TABLE}" }
   Remember the id returned by the create call — you will need it for the next steps.
3. List all data sources and confirm the one you created appears in the results by name.
4. Get the data source you created by its id (from step 2) to verify its name and settings match what you created.
5. Update the data source's name to "Eval Test Data Source {timestamp} Renamed", using the same id. Do not change formDataSourceTypeId or settings.
6. Get the data source again by its id to confirm the name was updated.
7. Delete the data source you created, using the same id.
8. Say "DATA SOURCE CRUD WORKFLOW COMPLETE" once all steps succeed.`,
      tools: [...DATA_SOURCE_TOOLS],
      requiredTools: [
        "create-data-source",
        "list-data-sources",
        "get-data-source",
        "update-data-source",
        "delete-data-source",
      ],
      successPattern: "DATA SOURCE CRUD WORKFLOW COMPLETE",
      verbose: true,
    }),
    timeout
  );
});
