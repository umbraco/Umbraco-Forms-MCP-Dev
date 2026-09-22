/**
 * Normalizes the `created`/`updated` fields on a scaffolded (never-persisted)
 * FormDesign before it is validated against the tool's output schema.
 *
 * Umbraco Forms' scaffold endpoints (`/form/scaffold`, `/form/scaffold/{template}`)
 * build a brand-new FormDesign that was never saved to the database. When its
 * Created/Updated DateTime is left at a C# default (DateTimeKind.Unspecified,
 * e.g. `0001-01-01T00:00:00`), the JSON comes back without a timezone
 * designator. The Zod schema (`local:true`) tolerates that, but the MCP
 * client's stricter RFC 3339 `date-time` format check on structuredContent
 * does not, so the tool call fails downstream with "must match format
 * date-time" even though this server's request/response handling is correct.
 *
 * This is a defensive workaround for that upstream Umbraco Forms behavior,
 * not a fix to this server's own schema.
 */
import type { HttpResponse } from "@umbraco-cms/mcp-server-sdk";

const HAS_TIMEZONE = /(Z|[+-]\d{2}:?\d{2})$/;

function normalizeDateTime(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    return new Date().toISOString();
  }

  if (HAS_TIMEZONE.test(value)) {
    return value;
  }

  const parsed = new Date(`${value}Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.getUTCFullYear() < 1970) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

export function normalizeScaffoldDates<T>(response: HttpResponse<T>): HttpResponse<T> {
  const data = response.data as { created?: unknown; updated?: unknown } | null | undefined;

  if (
    response.status < 200 ||
    response.status >= 300 ||
    !data ||
    typeof data !== "object" ||
    !("created" in data) ||
    !("updated" in data)
  ) {
    return response;
  }

  return {
    ...response,
    data: {
      ...data,
      created: normalizeDateTime(data.created),
      updated: normalizeDateTime(data.updated),
    } as T,
  };
}
