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

import { test, expect, type Page } from "@playwright/test";
import { startWorker, stopWorker } from "./helpers/worker-setup.js";
import { startInspector, stopInspector } from "./helpers/inspector-setup.js";

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
// Shared helpers
// ============================================================================

async function connectInspector(
  page: Page,
  workerUrl: string,
  inspectorUrl: string,
): Promise<Page> {
  await page.goto(inspectorUrl);
  await page.waitForLoadState("networkidle");

  const transportCombo = page.getByRole("combobox", { name: "Transport Type" });
  await transportCombo.click();
  await page.getByRole("option", { name: "Streamable HTTP" }).click();

  const urlInput = page.getByRole("textbox", { name: "URL" });
  await urlInput.waitFor({ timeout: 5000 });
  await urlInput.clear();
  await urlInput.fill(workerUrl);

  const connectionTypeCombo = page.getByRole("combobox", { name: "Connection Type" });
  await connectionTypeCombo.click();
  await page.getByRole("option", { name: "Direct" }).click();

  const isAuthorizeUrl = (url: URL) =>
    url.pathname === "/authorize" || url.pathname.includes("authorize") || url.pathname.includes("/umbraco");

  const popupPromise = page.context().waitForEvent("page").catch(() => null);
  const navigationPromise = page.waitForURL(isAuthorizeUrl).then(() => null as Page | null);

  await page.getByRole("button", { name: "Connect" }).click();

  const popup = await Promise.race([popupPromise, navigationPromise]);
  const oauthPage = popup ?? page;

  if (popup) {
    await popup.waitForURL(isAuthorizeUrl, { timeout: 15000 });
  }

  return oauthPage;
}

async function handleOAuthFlow(
  _mainPage: Page,
  oauthPage: Page,
  consentOptions?: {
    checkModes?: string[];
    uncheckModes?: string[];
    uncheckCollections?: string[];
    uncheckSlices?: string[];
    checkReadOnly?: boolean;
  },
): Promise<void> {
  const approveButton = oauthPage.locator('button[value="approve"]');
  await approveButton.waitFor();

  if (consentOptions) {
    if (consentOptions.checkModes) {
      for (const mode of consentOptions.checkModes) {
        const checkbox = oauthPage.locator(`.mode-checkbox[value="${mode}"]`);
        if (!(await checkbox.isChecked())) await checkbox.check();
      }
    }

    if (consentOptions.uncheckModes) {
      for (const mode of consentOptions.uncheckModes) {
        const checkbox = oauthPage.locator(`.mode-checkbox[value="${mode}"]`);
        if (await checkbox.isChecked()) await checkbox.uncheck();
      }
    }

    if (consentOptions.uncheckCollections) {
      for (const name of consentOptions.uncheckCollections) {
        const checkboxes = oauthPage.locator(`.collection-checkbox[value="${name}"]`);
        const count = await checkboxes.count();
        for (let i = 0; i < count; i++) {
          const cb = checkboxes.nth(i);
          if (await cb.isEnabled() && await cb.isChecked()) await cb.uncheck();
        }
      }
    }

    if (consentOptions.uncheckSlices) {
      for (const slice of consentOptions.uncheckSlices) {
        const checkbox = oauthPage.locator(`.slice-checkbox[value="${slice}"]`);
        if (await checkbox.isChecked()) await checkbox.uncheck();
      }
    }

    if (consentOptions.checkReadOnly) {
      const readOnlyCheckbox = oauthPage.locator('input[name="readOnly"]');
      if (!(await readOnlyCheckbox.isChecked())) await readOnlyCheckbox.check();
    }
  }

  await approveButton.click();

  // Umbraco login page
  await oauthPage.waitForURL(
    (url) => url.hostname === "localhost" && url.pathname.includes("/umbraco"),
    { timeout: 15000 },
  );

  const emailInput = oauthPage.getByRole("textbox").first();
  await emailInput.waitFor({ timeout: 10000 });
  await emailInput.fill("admin@test.com");
  await oauthPage.getByRole("textbox").nth(1).fill("SecurePass1234");
  await oauthPage.getByRole("button", { name: "Login" }).click();
}

/**
 * Navigate to the Tools tab, click List Tools, and extract tool names.
 */
async function getToolNames(page: Page, knownTools: string[] = ALL_KNOWN_TOOLS): Promise<string[]> {
  await expect(page.getByText("Connected")).toBeVisible({ timeout: 15000 });

  const toolsTab = page.getByRole("tab", { name: /Tools/i });
  await toolsTab.waitFor({ timeout: 10000 });
  await toolsTab.click();

  const listToolsButton = page.getByRole("button", { name: /List Tools/i });
  await listToolsButton.waitFor({ timeout: 10000 });
  await listToolsButton.click();

  // Wait for at least one known tool to appear
  await expect(
    page.locator(knownTools.map((t) => `:text-is("${t}")`).join(", ")).first(),
  ).toBeVisible({ timeout: 10000 });

  const visibleTools: string[] = [];
  for (const tool of knownTools) {
    const isVisible = await page
      .getByText(tool, { exact: true })
      .first()
      .isVisible()
      .catch(() => false);
    if (isVisible) visibleTools.push(tool);
  }
  return visibleTools;
}

/**
 * Click a tool in the list, run it, and return the result text.
 */
async function callTool(page: Page, toolName: string, resultMarker: string): Promise<string> {
  await page.getByText(toolName).click();

  const runButton = page.getByRole("button", { name: /Run|Execute/i });
  await runButton.waitFor({ timeout: 5000 });
  await runButton.click();

  await expect(page.getByText(resultMarker).first()).toBeVisible({
    timeout: 10000,
  });

  return (await page.locator("body").textContent()) ?? "";
}

// ============================================================================
// Tests
// ============================================================================

test.describe("Forms Hosted MCP Inspector E2E", () => {
  let workerUrl: string;
  let inspectorUrl: string;

  test.beforeAll(async () => {
    workerUrl = await startWorker();
    inspectorUrl = await startInspector();
  });

  test.afterAll(async () => {
    await stopInspector();
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

    const oauthPage = await connectInspector(page, workerUrl, inspectorUrl);
    await handleOAuthFlow(page, oauthPage, {
      checkModes: [...FORMS_MODES, "cms:system"],
    });

    const tools = await getToolNames(page);

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

    const oauthPage = await connectInspector(page, workerUrl, inspectorUrl);
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

    const oauthPage = await connectInspector(page, workerUrl, inspectorUrl);
    await handleOAuthFlow(page, oauthPage, {
      checkModes: ["form-design"],
    });

    const tools = await getToolNames(page);

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

    const oauthPage = await connectInspector(page, workerUrl, inspectorUrl);
    await handleOAuthFlow(page, oauthPage, {
      checkModes: ["submissions"],
    });

    const tools = await getToolNames(page);

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

    const oauthPage = await connectInspector(page, workerUrl, inspectorUrl);
    await handleOAuthFlow(page, oauthPage, {
      checkModes: ["submissions", "cms:system"],
    });

    const tools = await getToolNames(page);

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

    const oauthPage = await connectInspector(page, workerUrl, inspectorUrl);
    await handleOAuthFlow(page, oauthPage, {
      checkModes: [...FORMS_MODES, "cms:system"],
      checkReadOnly: true,
    });

    const tools = await getToolNames(page);

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

    const oauthPage = await connectInspector(page, workerUrl, inspectorUrl);
    await handleOAuthFlow(page, oauthPage, {
      checkModes: ["form-design"],
    });

    const tools = await getToolNames(page);
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

    const oauthPage = await connectInspector(page, workerUrl, inspectorUrl);
    await handleOAuthFlow(page, oauthPage, {
      checkModes: ["cms:system"],
    });

    const tools = await getToolNames(page);
    expect(tools).toContain("cms--get-server-information");

    const result = await callTool(page, "cms--get-server-information", "version");
    expect(result).toMatch(/\d+\.\d+\.\d+/);
  });
});
