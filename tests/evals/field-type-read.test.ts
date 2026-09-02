/**
 * Field Type Read Eval Test
 *
 * Verifies an LLM agent can chain the "field-type" collection's two
 * read-only tools: list the fixed, system-defined field types built into
 * Umbraco Forms (Short Answer, Long Answer, Checkbox, Dropdown, Date
 * Picker, File Upload, Rich Text, etc.), then fetch the full details for
 * one of them by its real id. Field types are not user-created content
 * (fixed system definitions), so this is a read-only smoke test against
 * the real, live Umbraco instance (no mocks exist for the Forms
 * Management API).
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const FIELD_TYPE_TOOLS = ["list-field-types", "get-field-type-by-id"] as const;

describe("Field Type Read Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should list field types then get details for one by its id",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. List all Umbraco Forms field types.
2. From that list, find the field type named "Short Answer" (or, if it is not present, pick the first field type in the list) and note its real "id" field. Never invent or guess an id — use only the exact id value returned by the list call.
3. Get the full details for that field type by its id.
4. Say "FIELD TYPE DETAILS RETRIEVED" followed by the alias and name of the field type you looked up.`,
      tools: [...FIELD_TYPE_TOOLS],
      requiredTools: [...FIELD_TYPE_TOOLS],
      successPattern: "FIELD TYPE DETAILS RETRIEVED",
      verbose: true,
    }),
    timeout
  );
});
