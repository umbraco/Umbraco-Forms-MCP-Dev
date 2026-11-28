/**
 * MCP Inspector E2E tests.
 *
 * Drives the MCP Inspector UI through the full OAuth flow, verifies the tools
 * list — the Forms tools and the CMS tools chained in-process from
 * `@umbraco-cms/mcp-dev` (prefixed `cms--`) — and executes a tool call on each.
 *
 * Two consent screens are covered:
 * - The default (ENABLE_CONSENT_TOOL_SELECTION unset), as in the editor MCP: no
 *   tool checkboxes, and the user gets every Forms and chained CMS tool.
 * - ENABLE_CONSENT_TOOL_SELECTION=true: mode/collection/slice checkboxes. There
 *   the chained CMS tools are opt-in — `@umbraco-cms/mcp-hosted` registers them
 *   only for the CMS modes ticked (`cms:<mode>`), and ticking only CMS modes
 *   hides the Forms tools — so tests that need both tick a Forms mode and a CMS
 *   mode.
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
// Tool lists and consent choices
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
  "cms--get-server-status",
  "cms--get-document-root",
  "cms--get-document-type-root",
  "cms--get-data-type-root",
  "cms--create-data-type",
  "cms--delete-data-type",
];

const ALL_TOOLS = [...FORMS_TOOLS, ...CMS_TOOLS];

// Every Forms mode, plus the CMS modes holding CMS_TOOLS (system: server;
// content: document; content-modeling: document-type, data-type).
const FORMS_AND_CMS_MODES = [
  "umbraco-server",
  "forms-management-all",
  "cms:system",
  "cms:content",
  "cms:content-modeling",
];

const CREDENTIALS = { email: "admin@admin.com", password: "1234567890" };

// ============================================================================
// Tests
// ============================================================================

test.afterEach(async ({ page }) => {
  const disconnectButton = page.getByRole("button", { name: "Disconnect" });
  if (await disconnectButton.isVisible().catch(() => false)) {
    await disconnectButton.click();
  }
});

test.describe("MCP Inspector E2E: default consent screen", () => {
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

  test("no tool selection; every Forms and chained CMS tool", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await oauthPage.locator('button[value="approve"]').waitFor();
    expect(await oauthPage.locator(".mode-checkbox").count()).toBe(0);
    expect(await oauthPage.locator('input[name="readOnly"]').count()).toBe(0);
    await handleOAuthFlow(page, oauthPage, undefined, CREDENTIALS);

    const tools = await getToolNames(page, ALL_TOOLS);
    for (const tool of ALL_TOOLS) {
      expect(tools).toContain(tool);
    }
  });

  test("execute a Forms tool and a chained CMS tool", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, undefined, CREDENTIALS);

    const tools = await getToolNames(page, ALL_TOOLS);
    expect(tools).toContain("get-server-info");
    expect(tools).toContain("cms--get-server-status");

    const formsResult = await callTool(page, "get-server-info", "assemblyVersion");
    expect(formsResult).toContain("assemblyVersion");

    // `serverStatus` only appears in this tool's response (a 401 would come back
    // as an error instead), so this proves the chained CMS client carries the
    // signed-in user's token.
    const cmsResult = await callTool(page, "cms--get-server-status", "serverStatus");
    expect(cmsResult).toContain('"serverStatus"');
  });
});

test.describe("MCP Inspector E2E: ENABLE_CONSENT_TOOL_SELECTION=true", () => {
  let workerUrl: string;
  let inspector: InspectorHandle;

  test.beforeAll(async () => {
    workerUrl = await startWorker({ ENABLE_CONSENT_TOOL_SELECTION: "true" });
    inspector = await startInspector({ client: 6284, proxy: 6287 });
  });

  test.afterAll(async () => {
    await inspector.stop();
    await stopWorker();
  });

  test("connect and list the Forms and chained CMS tools", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, { checkModes: FORMS_AND_CMS_MODES }, CREDENTIALS);

    const tools = await getToolNames(page, ALL_TOOLS);
    for (const tool of ALL_TOOLS) {
      expect(tools).toContain(tool);
    }
  });

  test("CMS tools are opt-in: none without a CMS mode ticked", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, undefined, CREDENTIALS);

    const tools = await getToolNames(page, ALL_TOOLS);
    for (const tool of FORMS_TOOLS) {
      expect(tools).toContain(tool);
    }
    for (const tool of CMS_TOOLS) {
      expect(tools).not.toContain(tool);
    }
  });

  test("consent screen mode filtering", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, { checkModes: ["forms-authoring"] }, CREDENTIALS);

    const tools = await getToolNames(page, ALL_TOOLS);

    // Only the forms-authoring collections should be present
    expect(tools).toContain("list-forms");
    expect(tools).not.toContain("list-data-sources");
    expect(tools).not.toContain("get-server-info");
    expect(tools).not.toContain("cms--get-document-root");
  });

  test("readOnly toggle excludes write tools, Forms and chained CMS", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, { checkModes: FORMS_AND_CMS_MODES, checkReadOnly: true }, CREDENTIALS);

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
