/**
 * Decorators for tools whose input is a JSON request *body* rather than URL
 * path/query segments.
 *
 * ## Why this exists
 *
 * `withStandardDecorators` applies the SDK's `withInputSanitization`, which
 * walks every string in the input and rejects four things: control
 * characters, path traversal (`../`), percent-encoding (`%20`) and embedded
 * query parameters (`?` / `&`).
 *
 * Those last two rules exist because most tool inputs are identifiers that get
 * interpolated into a URL, where a stray `?` silently truncates the path. They
 * are wrong for a form *design*, where the same strings are free text that a
 * human will read on a rendered web page. The practical effect was that
 * ordinary forms could not be created at all:
 *
 * ```
 * caption: "What is your name?"   -> rejected ('?')
 * messageOnSubmit: "Thanks & bye" -> rejected ('&')
 * regex: "^\\d+(\\.\\d{1,2})?$"   -> rejected ('?')
 * Html: '<a href="/a%20b">link</a>' -> rejected ('%20')
 * ```
 *
 * A question mark in a field label is not an injection risk — nothing here is
 * ever concatenated into a URL. So body tools swap the URL-oriented sanitiser
 * for `withBodyTextSanitization`, which keeps the two checks that still mean
 * something for a JSON body:
 *
 * - **control characters** — never legitimate in a label, and they corrupt the
 *   stored design and anything that later renders it;
 * - **path traversal** — form designs carry real file paths (e.g. a workflow's
 *   `RazorViewFilePath`), so `../` stays blocked. Relative `../` links inside
 *   rich-text HTML are rejected too; that is a deliberate trade, since a
 *   root-relative or absolute href is always available as an alternative.
 *
 * Everything else about the tool is unchanged — `withBodyDecorators` composes
 * exactly the same stack as `withStandardDecorators`, only with the sanitiser
 * swapped. Using the SDK's `[raw]` marker instead would have disabled *all*
 * sanitisation on those fields and leaked the marker text into the tool schema
 * the model reads.
 */

import type { ZodRawShape, ZodType } from "zod";
import {
  compose,
  rejectControlCharacters,
  sanitizeStringInput,
  withCursorPagination,
  withDryRun,
  withErrorHandling,
  withPreExecutionCheck,
  withTelemetry,
  type CursorPaginatedArgs,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";

/**
 * Recursively checks every string reachable from `value`.
 *
 * This walks the *value* rather than the Zod schema on purpose: the generated
 * form-design schemas nest unions and records several levels deep, and a
 * value-walk cannot be silently bypassed by a schema shape the walker does not
 * recognise.
 */
function checkBodyStrings(value: unknown, path: string): void {
  if (typeof value === "string") {
    // Control characters are rejected by `sanitizeStringInput` as well, but
    // calling it directly here keeps the intent obvious at the call site.
    rejectControlCharacters(value, path);
    sanitizeStringInput(value, path, {
      allowQueryParams: true,
      allowPreEncoded: true,
    });
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => checkBodyStrings(item, `${path}[${index}]`));
    return;
  }

  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      checkBodyStrings(child, path ? `${path}.${key}` : key);
    }
  }
}

/**
 * Body-appropriate replacement for the SDK's `withInputSanitization`.
 *
 * Rejects control characters and path traversal anywhere in the payload;
 * permits `?`, `&` and `%XX`, which are ordinary content in form labels,
 * validation messages, regular expressions and rich text.
 */
export function withBodyTextSanitization<
  Args extends undefined | ZodRawShape,
  OutputArgs extends undefined | ZodRawShape | ZodType = undefined,
>(tool: ToolDefinition<Args, OutputArgs>): ToolDefinition<Args, OutputArgs> {
  const originalHandler = tool.handler;

  return {
    ...tool,
    handler: ((args: Record<string, unknown>, context: unknown) => {
      if (args && typeof args === "object") {
        for (const [key, value] of Object.entries(args)) {
          checkBodyStrings(value, key);
        }
      }
      return originalHandler(args as never, context as never);
    }) as typeof tool.handler,
  };
}

/**
 * Drop-in replacement for `withStandardDecorators` for tools that accept a
 * JSON body. Identical stack and ordering; only the sanitiser differs.
 */
export function withBodyDecorators<
  Args extends undefined | ZodRawShape,
  OutputArgs extends undefined | ZodRawShape | ZodType = undefined,
>(
  tool: ToolDefinition<Args, OutputArgs>,
): ToolDefinition<CursorPaginatedArgs<Args>, OutputArgs> {
  const decorated = compose(
    withBodyTextSanitization,
    withDryRun,
    withPreExecutionCheck,
  )(tool);
  const paginated = withCursorPagination(decorated);
  const instrumented = withTelemetry(paginated);
  return withErrorHandling(instrumented);
}
