/**
 * Picker Read Eval Test
 *
 * Verifies an LLM agent can use the "picker" collection's read-only tools
 * correctly against the real, live Umbraco instance (no mocks exist for the
 * Forms Management API). Covers the 3 GET tools: list-picker-data-types,
 * list-picker-document-types, and get-picker-document-type-properties.
 * Excludes refresh-picker-document-type-mappings, which is a write-ish
 * recompute action and out of scope for this read-only eval.
 *
 * The document type alias passed to get-picker-document-type-properties must
 * be discovered dynamically from the list-picker-document-types result —
 * never hardcoded — since available document types vary by instance.
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const PICKER_READ_TOOLS = [
  "list-picker-data-types",
  "list-picker-document-types",
  "get-picker-document-type-properties",
] as const;

describe("Picker Read Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should list picker data types and document types, then get properties for a discovered document type",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. List the available picker data types using list-picker-data-types.
2. List the available picker document types using list-picker-document-types.
3. From the results of step 2, choose one document type and note its alias (the "id" field of one of the returned items). Never hardcode or guess an alias (do not assume it is "contact" or anything else) — use only an alias that was actually returned in step 2. If step 2 returned zero document types, skip steps 4, and note in your final answer that no document types were found.
4. If you found an alias in step 3, get its properties using get-picker-document-type-properties with that exact alias.
5. Say "PICKER PROPERTIES RETRIEVED" followed by the alias you used and the number of properties found (or "no document types found" if step 2 was empty).`,
      tools: [...PICKER_READ_TOOLS],
      requiredTools: ["list-picker-document-types", "get-picker-document-type-properties"],
      successPattern: "PICKER PROPERTIES RETRIEVED",
      verbose: true,
    }),
    timeout
  );
});
