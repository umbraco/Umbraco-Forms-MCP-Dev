/**
 * Member Read Eval Test
 *
 * Verifies an LLM agent can call the "member" collection's
 * get-member-linkable-properties tool with no filter, listing the Umbraco
 * member properties (alias and name) that can be linked to a form field.
 * This is a read-only smoke test against the real, live Umbraco instance
 * (no mocks exist for the Forms Management API). The other tool in this
 * collection, get-member-form-summaries, requires a real member key and is
 * intentionally excluded — this instance has zero members configured.
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const MEMBER_TOOLS = ["get-member-linkable-properties"] as const;

describe("Member Read Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should list linkable member properties with no filter",
    runScenarioTest({
      prompt: `Complete these tasks in order:
1. Get the list of Umbraco member properties that can be linked to a form field. Do not filter by fieldTypeId — call it with no filter so it returns all linkable properties.
2. Say "MEMBER LINKABLE PROPERTIES RETRIEVED" followed by the number of properties found and the alias of each one.`,
      tools: [...MEMBER_TOOLS],
      requiredTools: [...MEMBER_TOOLS],
      successPattern: "MEMBER LINKABLE PROPERTIES RETRIEVED",
      verbose: true,
    }),
    timeout
  );
});
