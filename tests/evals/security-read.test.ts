/**
 * Security Read Eval Test
 *
 * Verifies an LLM agent can use the "security" collection's read-only tools
 * correctly. This is a strictly read-only scenario — the security collection
 * also exposes create/update/delete tools for assigning Forms permissions to
 * real backoffice users and user groups, which must never be exercised by a
 * probabilistic eval against a live instance. Only get/list tools that touch
 * nothing but the caller's own permissions, the assignable-user list, and the
 * security tree are included here.
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const SECURITY_READ_TOOLS = [
  "get-current-user-form-security",
  "list-users-to-assign",
  "list-security-tree-root",
] as const;

describe("Security Read Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should retrieve current user security, assignable users, and the security tree root",
    runScenarioTest({
      prompt: `Complete these read-only tasks in order:
1. Get the Forms security configuration for the currently authenticated user.
2. List the backoffice users that can be assigned Forms security.
3. List the top-level nodes of the Forms security tree.
4. Say "SECURITY INFO RETRIEVED" followed by a short summary of what you found in each step (e.g. counts of permissions, assignable users, and tree nodes).

Only use the read/list tools available to you — do not create, update, or delete any security assignment.`,
      tools: [...SECURITY_READ_TOOLS],
      requiredTools: [...SECURITY_READ_TOOLS],
      successPattern: "SECURITY INFO RETRIEVED",
      verbose: true,
    }),
    timeout
  );
});
