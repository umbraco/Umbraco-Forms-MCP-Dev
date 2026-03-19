/**
 * MCP Inspector E2E tests for Umbraco Forms hosted MCP.
 *
 * Drives the MCP Inspector UI through the full OAuth flow with the real
 * Forms worker (src/worker.ts) that includes both Forms tool collections
 * and in-process CMS chaining.
 *
 * Verifies: tool listing, consent screen mode filtering, read-only toggle,
 * mixed mode selection, and tool execution across both servers.
 *
 * NOTE: Some Forms collections are auth-gated (require the user's Forms
 * security context). Reference-data collections (field-type, data-source-type,
 * prevalue-source-type, workflow-type) always appear regardless of auth.
 * Tests use these as reliable anchors for mode-filtering assertions.
 *
 * Prerequisites:
 * - Forms demo-site running at https://localhost:44374 (HTTP: 17813)
 * - Credentials: admin@test.com / SecurePass1234
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

/**
 * Tools that always appear (no auth gate) — grouped by mode.
 * These are the reliable anchors for filtering assertions.
 */

/** field-type collection (3 tools) — in form-design mode, always visible */
const FIELD_TYPE_TOOLS = [
  "get-field-type",
  "list-field-types",
  "list-field-type-validation-patterns",
];

/** data-source-type collection (2 tools) — in data-sources mode, always visible */
const DATA_SOURCE_TYPE_TOOLS = [
  "get-data-source-type",
  "list-data-source-types",
];

/** prevalue-source-type collection (2 tools) — in data-sources mode, always visible */
const PREVALUE_SOURCE_TYPE_TOOLS = [
  "get-prevalue-source-type",
  "list-prevalue-source-types",
];

/** workflow-type collection (2 tools) — in submissions mode, always visible */
const WORKFLOW_TYPE_TOOLS = [
  "get-workflow-type",
  "list-workflow-types",
];

/** Auth-gated tools that MAY appear if user has Forms access */
const AUTH_GATED_FORMS_TOOLS = [
  // form collection (form-design mode)
  "list-forms", "get-form", "get-form-scaffold", "get-form-scaffold-by-template",
  "list-form-templates", "get-form-tree", "get-form-tree-ancestors", "get-form-relations",
  "create-form", "copy-form", "copy-form-workflows", "update-form", "move-form", "delete-form",
  // folder collection (form-design mode)
  "get-folder", "check-folder-empty", "create-folder", "update-folder", "move-folder", "delete-folder",
  // data-source collection (forms-data + data-sources modes)
  "get-data-source", "list-data-sources", "get-data-source-tree", "get-data-source-tree-ancestors",
  "get-data-source-scaffold", "create-data-source", "update-data-source", "delete-data-source",
  // prevalue-source collection (data-sources mode)
  "get-prevalue-source", "list-prevalue-sources", "get-prevalue-source-values",
  "get-prevalue-source-tree", "get-prevalue-source-tree-ancestors", "get-prevalue-source-scaffold",
  "create-prevalue-source", "update-prevalue-source", "delete-prevalue-source",
  // record collection (submissions mode)
  "list-records", "get-record-metadata", "get-record-audit-trail",
  "get-record-workflow-audit-trail", "get-record-page-number", "list-record-set-actions",
  "update-record", "execute-record-action", "delete-records", "retry-record-workflow",
];

/** All possible forms tools (auth-gated + always-visible) */
const ALL_FORMS_TOOLS = [
  ...FIELD_TYPE_TOOLS,
  ...DATA_SOURCE_TYPE_TOOLS,
  ...PREVALUE_SOURCE_TYPE_TOOLS,
  ...WORKFLOW_TYPE_TOOLS,
  ...AUTH_GATED_FORMS_TOOLS,
];

/** Known CMS tools from the system mode */
const CMS_SYSTEM_TOOLS = [
  "cms--get-server-information",
  "cms--get-server-status",
  "cms--get-server-configuration",
  "cms--get-server-troubleshooting",
  "cms--get-server-upgrade-check",
];

/** Combined known tools for the getToolNames scanner */
const ALL_KNOWN_TOOLS = [...ALL_FORMS_TOOLS, ...CMS_SYSTEM_TOOLS];

// ============================================================================
// Mode definitions
// ============================================================================

const FORMS_MODES = ["forms-data", "form-design", "data-sources", "submissions"];

const CMS_MODES = [
  "cms:content", "cms:content-modeling", "cms:front-end", "cms:media",
  "cms:search", "cms:users", "cms:members", "cms:health",
  "cms:translation", "cms:system", "cms:integrations",
];

// ============================================================================
// Credentials for the Forms demo-site
// ============================================================================

const FORMS_CREDENTIALS = { email: "admin@test.com", password: "SecurePass1234" };

// ============================================================================
// Tests
// ============================================================================

test.describe("Forms Hosted MCP Inspector E2E", () => {
  let workerUrl: string;
  let inspector: InspectorHandle;

  test.beforeAll(async () => {
    workerUrl = await startWorker();
    inspector = await startInspector({ client: 6304, proxy: 6307 });
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

  // --------------------------------------------------------------------------
  // 1. Connect + list all tools
  // --------------------------------------------------------------------------

  test("connect + list all tools — forms + CMS chained tools present", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, {
      checkModes: [...FORMS_MODES, "cms:system"],
    }, FORMS_CREDENTIALS);

    const tools = await getToolNames(page, ALL_KNOWN_TOOLS);

    // Always-visible forms reference tools from each mode should be present
    for (const tool of FIELD_TYPE_TOOLS) {
      expect(tools, `expected field-type tool "${tool}"`).toContain(tool);
    }
    for (const tool of DATA_SOURCE_TYPE_TOOLS) {
      expect(tools, `expected data-source-type tool "${tool}"`).toContain(tool);
    }
    for (const tool of PREVALUE_SOURCE_TYPE_TOOLS) {
      expect(tools, `expected prevalue-source-type tool "${tool}"`).toContain(tool);
    }
    for (const tool of WORKFLOW_TYPE_TOOLS) {
      expect(tools, `expected workflow-type tool "${tool}"`).toContain(tool);
    }

    // CMS system tools should be present (chained with cms-- prefix)
    for (const tool of CMS_SYSTEM_TOOLS) {
      expect(tools, `expected CMS tool "${tool}"`).toContain(tool);
    }
  });

  // --------------------------------------------------------------------------
  // 2. Consent screen shows both mode sets
  // --------------------------------------------------------------------------

  test("consent screen shows both Forms and CMS mode checkboxes", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    const approveButton = oauthPage.locator('button[value="approve"]');
    await approveButton.waitFor();

    // Verify all Forms mode checkboxes exist
    for (const mode of FORMS_MODES) {
      const checkbox = oauthPage.locator(`.mode-checkbox[value="${mode}"]`);
      await expect(checkbox, `expected forms mode "${mode}" checkbox`).toBeVisible();
    }

    // Verify CMS mode checkboxes exist (prefixed with cms:)
    for (const mode of CMS_MODES) {
      const checkbox = oauthPage.locator(`.mode-checkbox[value="${mode}"]`);
      await expect(checkbox, `expected CMS mode "${mode}" checkbox`).toBeVisible();
    }

    // All should be unchecked by default
    for (const mode of [...FORMS_MODES, ...CMS_MODES]) {
      const checkbox = oauthPage.locator(`.mode-checkbox[value="${mode}"]`);
      expect(await checkbox.isChecked()).toBe(false);
    }

    // Approve without changes to clean up
    await approveButton.click();
    await oauthPage.waitForURL(
      (url) => url.hostname === "localhost" && url.pathname.includes("/umbraco"),
      { timeout: 15000 },
    );
  });

  // --------------------------------------------------------------------------
  // 3. Forms-only mode (form-design)
  // --------------------------------------------------------------------------

  test("form-design mode only — only form design tools, zero cms-- tools", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, {
      checkModes: ["form-design"],
    }, FORMS_CREDENTIALS);

    const tools = await getToolNames(page, ALL_KNOWN_TOOLS);

    // field-type tools should always be present (form-design mode, no auth gate)
    for (const tool of FIELD_TYPE_TOOLS) {
      expect(tools, `expected field-type tool "${tool}"`).toContain(tool);
    }

    // No CMS tools
    for (const tool of CMS_SYSTEM_TOOLS) {
      expect(tools, `unexpected CMS tool "${tool}"`).not.toContain(tool);
    }

    // No submissions-mode tools (workflow-type is always-visible but only in submissions mode)
    for (const tool of WORKFLOW_TYPE_TOOLS) {
      expect(tools, `unexpected submissions tool "${tool}"`).not.toContain(tool);
    }

    // No data-sources-mode tools
    for (const tool of DATA_SOURCE_TYPE_TOOLS) {
      expect(tools, `unexpected data-sources tool "${tool}"`).not.toContain(tool);
    }
  });

  // --------------------------------------------------------------------------
  // 4. No CMS modes = no CMS tools
  // --------------------------------------------------------------------------

  test("no CMS modes selected — no cms-- tools included", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, {
      checkModes: ["submissions"],
    }, FORMS_CREDENTIALS);

    const tools = await getToolNames(page, ALL_KNOWN_TOOLS);

    // workflow-type tools present (submissions mode, no auth gate)
    for (const tool of WORKFLOW_TYPE_TOOLS) {
      expect(tools).toContain(tool);
    }

    // No CMS tools
    for (const tool of CMS_SYSTEM_TOOLS) {
      expect(tools).not.toContain(tool);
    }

    // No form-design tools
    for (const tool of FIELD_TYPE_TOOLS) {
      expect(tools).not.toContain(tool);
    }
  });

  // --------------------------------------------------------------------------
  // 5. Mixed mode (submissions + cms:system)
  // --------------------------------------------------------------------------

  test("mixed mode — submissions + cms:system gives both tool sets", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, {
      checkModes: ["submissions", "cms:system"],
    }, FORMS_CREDENTIALS);

    const tools = await getToolNames(page, ALL_KNOWN_TOOLS);

    // Submissions reference tools present
    for (const tool of WORKFLOW_TYPE_TOOLS) {
      expect(tools, `expected submissions tool "${tool}"`).toContain(tool);
    }

    // CMS system tools present
    for (const tool of CMS_SYSTEM_TOOLS) {
      expect(tools, `expected CMS tool "${tool}"`).toContain(tool);
    }

    // No form-design tools
    for (const tool of FIELD_TYPE_TOOLS) {
      expect(tools).not.toContain(tool);
    }
  });

  // --------------------------------------------------------------------------
  // 6. Read-only across both servers
  // --------------------------------------------------------------------------

  test("readOnly excludes write tools from both forms and CMS", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, {
      checkModes: [...FORMS_MODES, "cms:system"],
      checkReadOnly: true,
    }, FORMS_CREDENTIALS);

    const tools = await getToolNames(page, ALL_KNOWN_TOOLS);

    // Auth-gated write tools should definitely NOT be present
    const formsWriteTools = [
      "create-data-source", "update-data-source", "delete-data-source",
      "create-folder", "update-folder", "move-folder", "delete-folder",
      "create-form", "update-form", "delete-form", "move-form",
      "copy-form", "copy-form-workflows",
      "create-prevalue-source", "update-prevalue-source", "delete-prevalue-source",
      "update-record", "execute-record-action", "delete-records", "retry-record-workflow",
    ];
    for (const tool of formsWriteTools) {
      expect(tools, `write tool "${tool}" should be excluded in readOnly`).not.toContain(tool);
    }

    // Always-visible read-only reference tools should still be present
    for (const tool of FIELD_TYPE_TOOLS) {
      expect(tools, `read tool "${tool}" should be present`).toContain(tool);
    }
    for (const tool of DATA_SOURCE_TYPE_TOOLS) {
      expect(tools, `read tool "${tool}" should be present`).toContain(tool);
    }

    // CMS system tools are all read-only, so they should remain
    for (const tool of CMS_SYSTEM_TOOLS) {
      expect(tools, `CMS read tool "${tool}" should be present`).toContain(tool);
    }
  });

  // --------------------------------------------------------------------------
  // 7. Call forms tool (list-field-types)
  // --------------------------------------------------------------------------

  test("call list-field-types — returns field type reference data", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, {
      checkModes: ["form-design"],
    }, FORMS_CREDENTIALS);

    const tools = await getToolNames(page, ALL_KNOWN_TOOLS);
    expect(tools).toContain("list-field-types");

    const result = await callTool(page, "list-field-types", "field-type");
    // Should contain field type data from the Forms API
    expect(result).toContain("field-type");
  });

  // --------------------------------------------------------------------------
  // 8. Call CMS chained tool (cms--get-server-information)
  // --------------------------------------------------------------------------

  test("call cms--get-server-information — returns Umbraco version info", async ({ page }) => {
    test.setTimeout(120000);

    const oauthPage = await connectInspector(page, workerUrl, inspector.url);
    await handleOAuthFlow(page, oauthPage, {
      checkModes: ["cms:system"],
    }, FORMS_CREDENTIALS);

    const tools = await getToolNames(page, ALL_KNOWN_TOOLS);
    expect(tools).toContain("cms--get-server-information");

    const result = await callTool(page, "cms--get-server-information", "version");
    expect(result).toMatch(/\d+\.\d+\.\d+/);
  });
});
