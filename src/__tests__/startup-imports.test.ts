import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createCmsCollectionsLoader, loadCmsCollections, getLoadedCmsCollections, needsCmsCollections } from "../umbraco-api/cms-collections-loader.js";

// Cloudflare limits Worker startup to 1 s of CPU. Importing
// @umbraco-cms/mcp-dev's collections builds every mcp-dev tool's schemas, which
// pushed the v18 Editor worker to ~930 ms. The Forms worker chains the same
// package on top of its own tools, so it is loaded on first request instead
// (cms-collections-loader.ts). A static import in worker.ts would move that
// cost back into startup.
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
// Any static value import, side-effect import or re-export of mcp-dev.
// `import type` / `export type` are erased at build time and allowed.
const MCP_DEV = String.raw`["']@umbraco-cms\/mcp-dev(?:\/[^"']*)?["']`;
const staticMcpDevImport = new RegExp(
  String.raw`^\s*(?:import\s+(?!type\b)(?:[^;]*?\bfrom\s+)?|export\s+(?!type\b)[^;]*?\bfrom\s+)` + MCP_DEV,
  "m",
);

describe("worker startup: mcp-dev is not imported at module scope", () => {
  it.each(["../worker.ts"])("%s has no static mcp-dev value import", (file) => {
    expect(read(file)).not.toMatch(staticMcpDevImport);
  });

  it.each([
    ['import { collections } from "@umbraco-cms/mcp-dev/collections";', true],
    ['import "@umbraco-cms/mcp-dev/collections";', true],
    ['import * as cms from "@umbraco-cms/mcp-dev";', true],
    ['export { collections } from "@umbraco-cms/mcp-dev/collections";', true],
    ['export * from "@umbraco-cms/mcp-dev/collections";', true],
    ['import type { CmsTools } from "@umbraco-cms/mcp-dev/tool-types";', false],
    ['export type { CmsTools } from "@umbraco-cms/mcp-dev/tool-types";', false],
    ['const cms = await import("@umbraco-cms/mcp-dev/collections");', false],
  ])("the guard flags %s: %s", (source, flagged) => {
    expect(staticMcpDevImport.test(source)).toBe(flagged);
  });

  it("loads the collections once and caches them", async () => {
    const first = await loadCmsCollections();
    const second = await loadCmsCollections();
    expect(second).toBe(first);
    expect(getLoadedCmsCollections()).toBe(first);
    expect(first.collections.length).toBeGreaterThan(0);
  });
});

const fakeCollections = (extra: Record<string, unknown> = {}) => ({
  collections: [], allModes: [], allModeNames: [], allSliceNames: [], ...extra,
});

describe("cms collections loader", () => {
  it("shares one in-flight load between concurrent callers", async () => {
    let calls = 0;
    const loader = createCmsCollectionsLoader(async () => { calls += 1; return fakeCollections(); });
    const [a, b] = await Promise.all([loader.load(), loader.load()]);
    expect(a).toBe(b);
    expect(calls).toBe(1);
  });

  it("keeps a failed load and rethrows it without importing again", async () => {
    let calls = 0;
    const loader = createCmsCollectionsLoader(async () => {
      calls += 1;
      throw new Error("boom");
    });
    await expect(loader.load()).rejects.toThrow("boom");
    await expect(loader.load()).rejects.toThrow("boom");
    expect(calls).toBe(1);
    expect(() => loader.get()).toThrow("not loaded");
  });

  it("rejects a half-initialised module (exports missing) instead of storing it", async () => {
    // What a bundled re-import returns after the module threw part-way through.
    const loader = createCmsCollectionsLoader(async () => fakeCollections({ allModes: undefined, allSliceNames: undefined }));
    await expect(loader.load()).rejects.toThrow("missing: allModes, allSliceNames");
    expect(() => loader.get()).toThrow("not loaded");
  });
});

describe("needsCmsCollections", () => {
  it.each([
    // consent tool selection off: only /info
    ["/info", false, true],
    ["/at/my-project.euwest01/info", false, true],
    ["/authorize", false, false],
    ["/callback", false, false],
    ["/", false, false],
    ["/mcp", false, false],
    // consent on: every default-handler request builds the consent config
    ["/authorize", true, true],
    ["/authorize/site-1", true, true],
    ["/callback", true, true],
    ["/callback/site-1", true, true],
    ["/logout-callback", true, true],
    ["/", true, true],
    ["/unknown", true, true],
    ["/at/my-project.euwest01/authorize", true, true],
    // a tenant alias / site id that is literally "mcp" still loads it
    ["/at/mcp/authorize", true, true],
    ["/authorize/mcp", true, true],
    // the MCP endpoints never: the Durable Object's init() loads it
    ["/mcp", true, false],
    ["/mcp/", true, false],
    ["/at/my-project.euwest01/mcp", true, false],
    ["/at/mcp/mcp", true, false],
  ])("%s (consent selection %s) -> %s", (path, consent, expected) => {
    expect(needsCmsCollections(path, consent)).toBe(expected);
  });
});
