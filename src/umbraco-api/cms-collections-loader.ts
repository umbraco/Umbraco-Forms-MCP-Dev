/**
 * Loads @umbraco-cms/mcp-dev's collections on first use instead of at module
 * scope.
 *
 * The hosted worker chains mcp-dev in-process, so its CMS tools sit next to the
 * Forms tools (`cms--get-document`, …) — the hosted counterpart of the stdio
 * entry point's `npx @umbraco-cms/mcp-dev@18` subprocess (config/mcp-servers.ts).
 *
 * Importing the collections builds the input/output schemas of every mcp-dev
 * tool. In the hosted worker that would run during Worker startup, which
 * Cloudflare caps at 1 s of CPU, on top of the Forms collections (the v18
 * Editor worker, which chains the same package, had reached about 930 ms).
 * Loading it on first use (worker.ts fetch for the routes that need it, and
 * init()) moves that cost out of startup. Same loader as the Editor MCP's.
 *
 * The loaded module is the same static code for every session, so caching it
 * at module level shares no per-session state.
 */
type CmsCollectionsModule = typeof import("@umbraco-cms/mcp-dev/collections");

/** The exports the worker reads; all must be arrays for the module to count as loaded. */
const REQUIRED_ARRAY_EXPORTS = ["collections", "allModes", "allModeNames", "allSliceNames"] as const;

/** @internal Exported for tests; use loadCmsCollections / getLoadedCmsCollections. */
export function createCmsCollectionsLoader<T>(importModule: () => Promise<T>) {
  let loaded: T | undefined;
  let loading: Promise<T> | undefined;

  return {
    /**
     * Loads the module once. A failed load is kept and rethrown on every later
     * call, without importing again: a module that throws while loading throws
     * again on re-import in Node, and in the bundled worker esbuild's run-once
     * wrapper returns the half-initialised module instead, so a retry can never
     * recover and must not be mistaken for success.
     */
    load(): Promise<T> {
      if (loaded) return Promise.resolve(loaded);
      loading ??= importModule().then((mod) => {
        const missing = REQUIRED_ARRAY_EXPORTS.filter(
          (name) => !Array.isArray((mod as Record<string, unknown>)[name]),
        );
        if (missing.length > 0) {
          throw new Error(`@umbraco-cms/mcp-dev collections loaded incompletely (missing: ${missing.join(", ")}).`);
        }
        loaded = mod;
        return mod;
      });
      return loading;
    },
    get(): T {
      if (!loaded) {
        throw new Error("@umbraco-cms/mcp-dev collections are not loaded: await loadCmsCollections() first (it may have failed; see the earlier error).");
      }
      return loaded;
    },
  };
}

const loader = createCmsCollectionsLoader<CmsCollectionsModule>(() => import("@umbraco-cms/mcp-dev/collections"));

export const loadCmsCollections = (): Promise<CmsCollectionsModule> => loader.load();

/**
 * The collections module, once loadCmsCollections() has resolved. For
 * synchronous readers (the chained server's consent config), which only run
 * inside request handlers after the worker's fetch entry has loaded it.
 */
export const getLoadedCmsCollections = (): CmsCollectionsModule => loader.get();

/**
 * True for requests whose handlers read the chained server's config
 * synchronously, so mcp-dev must be loaded first. Mirrors
 * @umbraco-cms/mcp-hosted's createDefaultHandler:
 * - `/info` always reads it.
 * - With consent tool selection on, the default handler builds the consent
 *   config at the start of every request it serves (before routing), which
 *   reads it too. That's every request except the MCP endpoints (`/mcp`,
 *   `/at/{alias}/mcp`), which go to the Durable Object, whose init() loads it.
 * With consent selection off, only `/info` needs it. The Forms worker has it on,
 * so the CMS modes appear on the consent screen next to the Forms ones.
 */
export function needsCmsCollections(pathname: string, consentToolSelection: boolean): boolean {
  if (/\/info$/.test(pathname)) return true;
  if (!consentToolSelection) return false;
  // Only the MCP endpoints themselves are skipped: exactly `/mcp` and
  // `/at/{alias}/mcp`. A tenant alias or site id that is literally "mcp"
  // (/at/mcp/authorize, /authorize/mcp) must still load it. Over-loading (e.g.
  // an MCP request to /at/{alias}/) only costs the one-off load in this isolate.
  return !/^(?:\/at\/[^/]+)?\/mcp\/?$/.test(pathname);
}
