/**
 * Email Template Read Eval Test
 *
 * Verifies an LLM agent can use the "email-template" collection's tree-root
 * read tool correctly. This instance's email-template tree root has exactly
 * one leaf item and no folders, so there is nothing to descend into with
 * get-email-template-tree-children — the scenario is scoped to browsing the
 * root only, against the real, live Umbraco instance (no mocks exist for the
 * Forms Management API).
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

describe("Email Template Read Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should browse the email template tree root",
    runScenarioTest({
      prompt: `Get the root-level items of the email template tree, then say "EMAIL TEMPLATE TREE RETRIEVED" followed by a short summary of what you found (how many items, their names, and whether each is a folder).`,
      tools: ["get-email-template-tree-root"],
      requiredTools: ["get-email-template-tree-root"],
      successPattern: "EMAIL TEMPLATE TREE RETRIEVED",
      verbose: true,
    }),
    timeout
  );
});
