/**
 * MCP Inspector E2E tests.
 *
 * Drives the MCP Inspector UI through the full OAuth flow, verifies the tools
 * list — the Forms tools and the CMS tools chained in-process from
 * `@umbraco-cms/mcp-dev` (prefixed `cms--`) — and executes a tool call on each.
 *
 * Prerequisites:
 * - The demo site running (`npm run start:umbraco`), with the hosted OAuth
 *   client from demo-site/McpOAuthComposer.cs. Its URLs are set in
 *   helpers/worker-setup.ts and can be overridden with E2E_UMBRACO_BASE_URL /
 *   E2E_UMBRACO_SERVER_URL.
 * - Worker and Inspector started automatically in beforeAll
 *
 * Run: npm run test:e2e
 */

import { test, expect } from "@playwright/test";
import { startWorker, stopWorker } from "./helpers/worker-setup.js";
import {
  startInspector, connectInspector, handleOAuthFlow,
  getToolNames, callTool, type InspectorHandle,
} from "@umbraco-cms/mcp-hosted/testing";

// ============================================================================
// Tool lists
// ============================================================================

const FORMS_TOOLS = [
  "get-server-info",
  "list-forms",
  "create-simple-form",
  "delete-form",
  "get-form-scaffold",
  "list-field-types",
  "list-themes",
  "list-data-sources",
  "list-workflow-types",
];

// Chained from @umbraco-cms/mcp-dev by registerChainedTools in worker.ts.
const CMS_TOOLS = [
  "cms--get-server-information",
  "cms--get-document-root",
  "cms--get-document-type-root",
  "cms--get-data-type-root",
  "cms--create-data-type",
  "cms--delete-data-type",
];

const ALL_TOOLS = [...FORMS_TOOLS, ...CMS_TOOLS];

// ============================================================================
// Tests
// ============================================================================

test.describe("MCP Inspector E2E", () => {
  let workerUrl: string;
  let inspector: InspectorHandle;

  test.beforeAll(async () => {
    workerUrl = await startWorker();
    inspector = await startInspector({ client: 6284, proxy: 6287 });
  });

  test.afterAll(async () => {
    await inspector.stop();
    await stopWorker();
  });

  test.afterEach(async ({ page }) => {
    const disconnectButton = page.getByRole("button", { name: "Disconnect" });
    if (await disconnectButton.isVisible().catch(() => false)) {
      await disconnectButton.click();
    }
  });

  test("connect and list the Forms and chained CMS tools", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, undefined, {
      email: "admin@admin.com",
      password: "1234567890",
    });

    const tools = await getToolNames(page, ALL_TOOLS);
    for (const tool of ALL_TOOLS) {
      expect(tools).toContain(tool);
    }
  });

  test("execute a Forms tool and a chained CMS tool", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, undefined, {
      email: "admin@admin.com",
      password: "1234567890",
    });

    const tools = await getToolNames(page, ALL_TOOLS);
    expect(tools).toContain("get-server-info");
    expect(tools).toContain("cms--get-server-information");

    const formsResult = await callTool(page, "get-server-info", "assemblyVersion");
    expect(formsResult).toContain("assemblyVersion");

    // Proves the chained CMS client carries the signed-in user's token.
    const cmsResult = await callTool(page, "cms--get-server-information", "version");
    expect(cmsResult).toContain("version");
  });

  test("consent screen mode filtering", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, {
      checkModes: ["forms-authoring"],
    }, {
      email: "admin@admin.com",
      password: "1234567890",
    });

    const tools = await getToolNames(page, ALL_TOOLS);

    // Only the forms-authoring collections should be present
    expect(tools).toContain("list-forms");
    expect(tools).not.toContain("list-data-sources");
    expect(tools).not.toContain("get-server-info");
  });

  test("readOnly toggle excludes write tools, Forms and chained CMS", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, { checkReadOnly: true }, {
      email: "admin@admin.com",
      password: "1234567890",
    });

    const tools = await getToolNames(page, ALL_TOOLS);

    // Write tools should be excluded
    expect(tools).not.toContain("create-simple-form");
    expect(tools).not.toContain("delete-form");
    expect(tools).not.toContain("cms--create-data-type");
    expect(tools).not.toContain("cms--delete-data-type");

    // Read-only tools should remain
    expect(tools).toContain("list-forms");
    expect(tools).toContain("get-server-info");
    expect(tools).toContain("cms--get-document-root");
  });
});
