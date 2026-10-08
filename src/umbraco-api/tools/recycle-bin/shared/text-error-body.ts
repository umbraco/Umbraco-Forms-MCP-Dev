import type { ProblemDetails } from "@umbraco-cms/mcp-server-sdk";

/**
 * The permanent-delete endpoints refuse an item that isn't in the recycle bin
 * with `BadRequest("...")` - a plain-text body, not ProblemDetails. The SDK
 * passes an error body through as the tool's structuredContent, which MCP
 * requires to be an object, so a client would get a protocol error instead of
 * the message. Wrap the text so it arrives as an ordinary tool error.
 */
export function textErrorBodyAsProblemDetails(error: ProblemDetails): ProblemDetails {
  const body: unknown = error;
  return typeof body === "string" ? { status: 400, title: "Bad Request", detail: body } : error;
}
