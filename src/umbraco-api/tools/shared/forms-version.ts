/**
 * Umbraco Forms version gates.
 *
 * Some Management API endpoints arrived partway through a major line, and each
 * line got them at its own minor: Umbraco Forms 17.x and 18.x are released side
 * by side, so a single "18.1 or later" check would wrongly refuse an endpoint on
 * Forms 17.5. Every gate looks up the minimum for the connected major.
 *
 * On a Forms version without the endpoint the server answers a bare 404, which
 * reads to a model like "that id doesn't exist". `withFormsFeature` turns it
 * into a message naming the version the tool needs. It only looks the installed
 * version up after a 404/405, so a call that works costs nothing extra.
 *
 * Minimums were read from the Management API controllers of every Umbraco
 * Forms 17.x and 18.x release, and checked against the swagger documents
 * Forms 17.0.1 and 17.5.2 serve.
 */

import {
  UmbracoApiError,
  UmbracoManagementClient,
  CAPTURE_RAW_HTTP_RESPONSE,
  type HttpResponse,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";

/** The first Umbraco Forms version with each endpoint group, per major. */
export const FORMS_FEATURE_MIN_VERSIONS = {
  /** GET /tree/{form,data-source,prevalue-source}/ancestors. */
  treeAncestors: { 17: "17.1.0", 18: "18.0.0" },
  /** GET /form/search. */
  formSearch: { 17: "17.2.0", 18: "18.0.0" },
  /** GET /form/are-referenced, /form/{id}/referenced-by and /form/{id}/referenced-descendants. */
  formReferences: { 17: "17.2.0", 18: "18.0.0" },
  /** GET /form/collection. */
  formCollection: { 17: "17.3.0", 18: "18.0.0" },
  /** POST /analytics/*. */
  analytics: { 17: "17.3.0", 18: "18.0.0" },
  /** GET /prevalue-source/{id}/text-file/{fileName}. */
  prevalueSourceTextFile: { 17: "17.4.0", 18: "18.0.0" },
  /** GET /member/linkable-properties and /member/{memberKey}/form-summaries. */
  memberForms: { 17: "17.5.0", 18: "18.1.0" },
  /**
   * PUT /{form,folder}/{id}/restore, DELETE /{form,folder}/{id}/permanent,
   * GET /{form,folder}/{id}/original-parent, GET /tree/recycle-bin/* and DELETE /recycle-bin/empty.
   */
  recycleBin: { 17: "17.6.0", 18: "18.2.0" },
  /** GET /form/{id}/version, GET /form/version/{versionId}, POST .../rollback and PUT .../prevent-cleanup. */
  formVersions: { 17: "17.6.0", 18: "18.2.0" },
  /** GET /form/{id}/audit-log. */
  formAuditLog: { 17: "17.6.0", 18: "18.2.0" },
  /** POST /form/{formId}/record and DELETE /form/{formId}/record/{recordId}. */
  recordWrite: { 17: "17.6.0", 18: "18.2.0" },
} as const satisfies Record<string, Record<number, string>>;

export type FormsFeature = keyof typeof FORMS_FEATURE_MIN_VERSIONS;

type Version = [major: number, minor: number, patch: number];

function parseVersion(version: string | undefined): Version | undefined {
  const [major, minor, patch = 0] = (version ?? "").split(/[.+-]/).map(Number);
  if (!Number.isFinite(major) || !Number.isFinite(minor) || !Number.isFinite(patch)) return undefined;
  return [major, minor, patch];
}

function compareVersions(a: Version, b: Version): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

/**
 * Whether a Forms version has a feature. A major newer than any in the table has
 * it; an older one does not. An unreadable version is assumed to have it, so a
 * missing manifest entry never hides the server's own error.
 */
export function formsVersionSupports(feature: FormsFeature, version: string | undefined): boolean {
  const installed = parseVersion(version);
  if (!installed) return true;

  const minimums: Record<number, string> = FORMS_FEATURE_MIN_VERSIONS[feature];
  const minimum = parseVersion(minimums[installed[0]]);
  if (minimum) return compareVersions(installed, minimum) >= 0;

  const majors = Object.keys(minimums).map(Number);
  return installed[0] > Math.max(...majors);
}

/** The feature's minimum on the installed version's major ("17.3"), or undefined if the major isn't in the table. */
export function minimumFormsVersion(feature: FormsFeature, version: string | undefined): string | undefined {
  const major = parseVersion(version)?.[0];
  const minimum =
    major === undefined ? undefined : (FORMS_FEATURE_MIN_VERSIONS[feature] as Record<number, string>)[major];
  return minimum?.replace(/\.0$/, "");
}

/** The installed Umbraco Forms version, from the backoffice package manifest; undefined if it can't be read. */
export async function getFormsVersion(): Promise<string | undefined> {
  try {
    const response = (await UmbracoManagementClient<{ id?: string; version?: string }[]>(
      { method: "GET", url: "/umbraco/management/api/v1/manifest/manifest" },
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as unknown as HttpResponse<{ id?: string; version?: string }[]>;
    return response.data?.find?.((p) => p.id === "Umbraco.Forms")?.version || undefined;
  } catch {
    return undefined;
  }
}

/** Whether an error is the bare 404/405 a Forms version without the endpoint answers. */
export function isMissingEndpointError(error: unknown): boolean {
  if (!(error instanceof UmbracoApiError)) return false;
  const status = (error.problemDetails as { status?: number } | undefined)?.status;
  return status === 404 || status === 405;
}

/**
 * Replaces the 404 a gated tool gets on a Forms version without its endpoint
 * with an error naming the version it needs. Any other failure, and any 404 on
 * a version that has the endpoint (an unknown id, say), passes through as is.
 *
 * Apply it inside the standard decorators, so their error handling formats the
 * result: `withStandardDecorators(withFormsFeature("analytics", tool))`.
 */
export function withFormsFeature<T extends ToolDefinition<any, any>>(
  feature: FormsFeature,
  tool: T,
  alternative?: string,
): T {
  const handler = tool.handler;
  return {
    ...tool,
    handler: (async (...params: unknown[]) => {
      try {
        return await (handler as (...args: unknown[]) => unknown)(...params);
      } catch (error) {
        if (!isMissingEndpointError(error)) throw error;

        const version = await getFormsVersion();
        if (formsVersionSupports(feature, version)) throw error;

        const minimum = minimumFormsVersion(feature, version);
        const major = version?.split(".")[0];
        throw new UmbracoApiError({
          status: 404,
          title: "Not available on this Umbraco Forms version",
          detail:
            `${tool.name} needs Umbraco Forms ${minimum ? `${minimum} or later on Umbraco ${major}` : "a newer release"}; ` +
            `this site runs Umbraco Forms ${version}.` +
            (alternative ? ` ${alternative}` : ""),
        });
      }
    }) as unknown as T["handler"],
  };
}
